import { findSessionById, addMessageToHistory, getHistoryForSession } from './history.service';
import { getAiRawResponse } from './gemini.service';
import { AiResponse, AiResponseSchema, outputFormat } from '../config/ai.config';
import { withRetry } from '../utils/retry.util';
import { z } from "zod";
import { buildFinalPrompt } from './prompt.service';

/**
 * Add a new message to an existing session and get a validated AI response.
 * This function encapsulates the complete process of "Add User Message -> Invoke AI -> Verify/Retry -> Save Model Message".
 *
 * @param sessionId - The ID of the existing session
 * @param userContent - The content of a new message sent by the user
 * @returns Returns a validated, successful AI response
 */
export const addMessageAndGetValidatedResponse = async (sessionId: string, userContent: string): Promise<AiResponse> => {
    // 1. Make sure the session exists
    await findSessionById(sessionId);

    // 2. Add the user's new messages to the history
    await addMessageToHistory(sessionId, 'user', userContent);

    let rawResponseText = '';

    // 3. Use the withRetry tool to get and validate the response of the AI
    const validatedResponseString = await withRetry({
        action: async (correctionMessage?: string) => {
            // If there's a correction message, we need to handle it.
            // For now, we'll treat it as a new request on the last known good state.
            let userTaskContent = userContent;
            if (correctionMessage) {
                // Prepend the correction instruction to the user's original request.
                userTaskContent = `${correctionMessage}\n\nOriginal Request: ${userContent}`;
            }

            // Get the full history to find the last known state.
            const currentHistory = await getHistoryForSession(sessionId);
            // Find the most recent 'model' message that has project data.
            const lastModelMessageWithState = [...currentHistory]
                .reverse()
                .find(m => m.role === 'model' && m.projectData);

            const projectDataForPrompt = lastModelMessageWithState?.projectData
                ? lastModelMessageWithState.projectData as object
                : undefined;

            // Build the final prompt. It will automatically select ADJUST or CREATE template
            // based on whether projectDataForPrompt exists.
            // Crucially, we are NOT passing the conversation history anymore.
            const finalPrompt = buildFinalPrompt(
                userTaskContent,
                projectDataForPrompt
            );

            // Send the constructed prompt to the Gemini Service
            rawResponseText = await getAiRawResponse(finalPrompt);
            console.log(`[session.service -> addMessageAndGetValidatedResponse response]: ${rawResponseText}`)
            return rawResponseText;
        },
        validate: (response) => {
            try {
                const parsedJson = JSON.parse(response);
                AiResponseSchema.parse(parsedJson);
            } catch (error) {
                (error as any).rawData = response;
                throw error;
            }
        },
        generateCorrectionMessage: (failedResponse, error) => {
            const failureReason = error instanceof z.ZodError
                ? `Zod validation failed: ${error.errors.map(e => e.message).join(', ')}`
                : `JSON parsing failed: ${(error as Error).message}`;

            return `
                ATTENTION: Your last response could not be processed due to a structural error.
                ---
                FAILURE REASON: ${failureReason}
                ---
                YOUR INVALID RESPONSE:
                ${failedResponse}
                ---
                REMINDER: You MUST follow the schema. Here is an example of a CORRECT and VALID JSON structure. Your output MUST match this format exactly:
                \`\`\`json
                ${JSON.stringify(outputFormat, null, 2)}
                \`\`\`
                ---
                Please provide a new, corrected JSON object that strictly follows all rules and the format example.
            `;
        }
    });

    const validatedResponse = AiResponseSchema.parse(JSON.parse(validatedResponseString));

    // 4. After successful validation, the AI's response is saved to the history
    await addMessageToHistory(sessionId, 'model', rawResponseText, {
        userMessage: validatedResponse.userMessage,
        projectData: validatedResponse.data ?? undefined,
    });

    console.log(`[Session Service] AI Service returned a validated response for session ${sessionId}.`);
    return validatedResponse;
};
