import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/prisma';
import { getAiRawResponse, getAiTitle } from './gemini.service';
import { AiResponseSchema } from '../config/ai.config';
import { Message, Session, SessionType } from "@prisma/client";
import { z } from "zod";
import { withRetry } from '../utils/retry.util';
import { buildFinalPrompt } from './prompt.service';

/**
 * Internal core functions that handle all the business logic for creating a new session.
 * It encapsulates AI calls, response validation, retries, and database transactions.
 * @param projectId - Parent project ID
 * @param sessionType - Session type ('CREATE' or 'ADJUST')
 * @param content - Text input from the user
 * @param initialJsonLayout - [optional] INITIAL JSON LAYOUT FOR TYPE 'ADJUST'
 * @returns Returns the newly created session and the verified AI response
 */
const createSessionInternal = async (
    projectId: string,
    sessionType: SessionType,
    content: string,
    initialJsonLayout?: object
): Promise<{ newSession: Session; validatedResponse: any }> => {
    const tempHistoryForAi: Partial<Message>[] = [];
    let rawResponseText = '';

    const validatedResponseString = await withRetry({
        action: async (correctionMessage?: string) => {
            if (correctionMessage) {
                tempHistoryForAi.length = 0;
                tempHistoryForAi.push({ role: 'system', content: correctionMessage });
            }
            const finalPrompt = buildFinalPrompt(
                tempHistoryForAi as Message[],
                sessionType,
                initialJsonLayout
            );
            rawResponseText = await getAiRawResponse(finalPrompt);
            console.log(`[project.service -> createSessionInternal -> getAiRawResponse response]: ${rawResponseText}`)
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

    const finalValidatedResponse = AiResponseSchema.parse(JSON.parse(validatedResponseString));
    const title = await getAiTitle(content);
    const newSessionId = uuidv4();

    const newSession = await prisma.$transaction(async (tx) => {
        const session = await tx.session.create({
            data: { id: newSessionId, projectId, title, sessionType }
        });
        await tx.message.create({
            data: { sessionId: newSessionId, role: 'user', content }
        });
        await tx.message.create({
            data: {
                sessionId: newSessionId,
                role: 'model',
                content: rawResponseText,
                userMessage: finalValidatedResponse.userMessage,
                projectData: finalValidatedResponse.data ?? undefined,
            }
        });
        return session;
    });

    return { newSession, validatedResponse: finalValidatedResponse };
};

/**
 * [public] Create a new session from scratch。
 * @param projectId - Project ID
 * @param content - Text input from the user
 */
export const createNewSession = async (projectId: string, content: string) => {
    // Invoke intrinsic functions directly, of type CREATE, without an initial layout
    return createSessionInternal(projectId, SessionType.CREATE, content, undefined);
};

/**
 * [Public] Adjust based on the existing layout to create a new session.
 * @param projectId - Project ID
 * @param content - Text input from the user
 * @param jsonLayout - Required, existing UI layout JSON
 */
export const createSessionFromAdjustment = async (projectId: string, content: string, jsonLayout: object) => {
    // Call the intrinsic function directly, of type ADJUST, and pass in the layout
    return createSessionInternal(projectId, SessionType.ADJUST, content, jsonLayout);
};
