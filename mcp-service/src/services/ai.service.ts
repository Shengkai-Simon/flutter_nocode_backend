import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import { getAiRawResponse } from './gemini.service';
import { addMessageToHistory, getHistoryForSession } from './history.service';
import {SchemaType} from "@google/generative-ai";

export const AiResponseSchema = z.object({
    data: z.record(z.any()).nullable(),
    userMessage: z.string(),
});
export type AiResponse = z.infer<typeof AiResponseSchema>;

const schemaJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/project_schema_v1.json'), 'utf8'));
const exampleJSON:SchemaType.OBJECT = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/example_project_v1.json'), 'utf8'));

const outputFormat = {"data": exampleJSON, "userMessage": "information content returned to the user for display"}

export const SYSTEM_PROMPT = `
# AI role setting: You are a seasoned designer and Flutter expert, currently serving as a UI layout generator specialist
## 1. Component Schema Specification (rules that must be followed)${JSON.stringify(schemaJSON)}
## 2. The output structure must also be JSON (syntax example that must be followed). Here is the output JSON format: ${JSON.stringify(outputFormat)}
`;

/**
 * Encapsulates the complete AI invocation, validation, and retry logic
 * @param sessionId - The ID of the current session
 * @returns Returns a validated, successful AI response
 * @throws If it still fails after multiple retries, an error is thrown
 */
export const getValidatedAiResponseWithRetry = async (sessionId: string): Promise<AiResponse> => {
    let retries = 3;
    let lastFailureReason: string = '';

    while (retries > 0) {
        const currentHistory = await getHistoryForSession(sessionId);
        const rawResponseText = await getAiRawResponse(currentHistory, SYSTEM_PROMPT);

        try {
            const parsedJson = JSON.parse(rawResponseText);
            const validatedResponse = AiResponseSchema.parse(parsedJson);

            // After success, this successful response of the AI is saved to the history
            await addMessageToHistory(sessionId, 'model', rawResponseText, {
                userMessage: validatedResponse.userMessage,
                projectData: validatedResponse.data ?? undefined,
            });

            console.log(`[AI Service] Validation successful for session ${sessionId}.`);
            return validatedResponse;

        } catch (error) {
            retries--;
            lastFailureReason = error instanceof z.ZodError
                ? `Zod validation failed: ${error.errors.map(e => e.message).join(', ')}`
                : `JSON parsing failed: ${(error as Error).message}`;

            console.warn(`[AI Service] AI response processing failed for session ${sessionId}. Reason: ${lastFailureReason}. Retries left: ${retries}`);

            if (retries > 0) {
                // Save the original error response and correction information as a 'system' message
                const correctionMessage = `
                    ATTENTION: Your last response could not be processed.
                    --- RAW AI RESPONSE ---
                    ${rawResponseText}
                    --- FAILURE REASON ---
                    ${lastFailureReason}
                    ---
                    Please provide a new, corrected JSON object that strictly follows all rules.
                `;
                await addMessageToHistory(sessionId, 'system', correctionMessage);
            }
        }
    }

    // After all retries fail, an explicit error is thrown
    throw new Error(`Failed to get a valid response from AI for session ${sessionId} after multiple attempts. Last failure: ${lastFailureReason}`);
};
