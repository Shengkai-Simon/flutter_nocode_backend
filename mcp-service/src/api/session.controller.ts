import { Request, Response, NextFunction } from 'express';
import { findOrCreateSession, addMessageToHistory, getHistoryForSession } from '../services/history.service';
import { getAiRawResponse } from '../services/gemini.service';
import { ResponseHandler } from '../utils/response.util'
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import {SchemaType} from "@google/generative-ai";

// Zod Schema definition
const AiResponseSchema = z.object({
    data: z.record(z.any()).nullable(),
    userMessage: z.string(),
});
type AiResponse = z.infer<typeof AiResponseSchema>;

// ---Use the fs module to read JSON files securely---
const schemaJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/project_schema_v1.json'), 'utf8'));
const exampleJSON:SchemaType.OBJECT = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/example_project_v1.json'), 'utf8'));

const outputFormat = {"data": exampleJSON, "userMessage": "information content returned to the user for display"}

const SYSTEM_PROMPT = `
# AI role setting: You are a seasoned designer and Flutter expert, currently serving as a UI layout generator specialist
## 1. Component Schema Specification (rules that must be followed)${JSON.stringify(schemaJSON)}
## 2. The output structure must also be JSON (syntax example that must be followed). Here is the output JSON format: ${JSON.stringify(outputFormat)}
`;

export const handleNewMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const { content, projectId } = req.body;

        if (!content || !projectId) {
            ResponseHandler.error(res, '`content` and `projectId` are required.', 400);
            return;
        }

        await findOrCreateSession(sessionId, projectId);
        await addMessageToHistory(sessionId, 'user', content);

        let retries = 3;
        let lastSuccessfulAiResponse: AiResponse | null = null;

        let lastRawResponseText: string = '';
        let lastFailureReason: string = 'AI did not provide a response.';

        while (retries > 0) {
            const currentHistory = await getHistoryForSession(sessionId);
            lastRawResponseText = await getAiRawResponse(currentHistory, SYSTEM_PROMPT);
            await addMessageToHistory(sessionId, 'model', lastRawResponseText);

            try {
                const parsedJson = JSON.parse(lastRawResponseText);
                const validatedResponse = AiResponseSchema.parse(parsedJson);

                console.log(`[Controller] Validation successful. Breaking loop.`);
                lastSuccessfulAiResponse = validatedResponse;
                break;

            } catch (error) {
                retries--;
                lastFailureReason = error instanceof z.ZodError
                    ? `Zod validation failed: ${error.errors.map(e => e.message).join(', ')}`
                    : `JSON parsing failed: ${(error as Error).message}`;

                console.warn(`[Controller] AI response processing failed. Reason: ${lastFailureReason}. Retries left: ${retries}`);

                if (retries > 0) {
                    const correctionMessage = `
                 ATTENTION: Your last response could not be processed.
                --- RAW AI RESPONSE ---
                ${lastRawResponseText}
                --- FAILURE REASON ---
                ${lastFailureReason}
                ---
                Please provide a new, corrected JSON object that strictly follows all rules.`;
                    await addMessageToHistory(sessionId, 'system', correctionMessage);
                }
            }
        }

        if (lastSuccessfulAiResponse) {
            ResponseHandler.success(res, lastSuccessfulAiResponse)
        } else {
            console.error(`[Controller] Final failure: AI did not provide a valid response after all retries for session ${sessionId}.`);
            console.error(`[Controller] Last Failure Reason: ${lastFailureReason}`);
            console.error(`[Controller] Last Raw AI Response: ${lastRawResponseText}`);

            const finalError = new Error("Failed to get a valid response from AI after multiple attempts.");
            next(finalError);
        }
    } catch (error) {
        next(error);
    }
};
