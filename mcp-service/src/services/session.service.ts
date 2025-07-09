import { findSessionById, addMessageToHistory, getHistoryForSession } from './history.service';
import { getAiRawResponse } from './gemini.service';
import { AiResponse, AiResponseSchema } from '../config/ai.config';
import { withRetry } from '../utils/retry.util';
import { z } from "zod";
import { buildFinalPrompt } from './prompt.service';
import {SessionType} from "@prisma/client";

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
            // If there is a remediation message, add it to the end of history as a 'system' message
            if (correctionMessage) {
                await addMessageToHistory(sessionId, 'system', correctionMessage);
            }

            // Get up-to-date history
            const currentHistory = await getHistoryForSession(sessionId);

            // Call the PromptService to build the final Prompt
            const finalPrompt = buildFinalPrompt(currentHistory, SessionType.CREATE);

            // Send the built Prompt to the simplified Gemini Service
            rawResponseText = await getAiRawResponse(finalPrompt);
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
                ATTENTION: Your last response could not be processed.
                --- RAW AI RESPONSE ---
                ${failedResponse}
                --- FAILURE REASON ---
                ${failureReason}
                ---
                Please provide a new, corrected JSON object that strictly follows all rules.
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
