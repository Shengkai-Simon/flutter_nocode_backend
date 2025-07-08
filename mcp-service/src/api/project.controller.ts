import {NextFunction, Request, Response} from 'express';
import {ResponseHandler} from '../utils/response.util';
import {v4 as uuidv4} from 'uuid';
import prisma from '../config/prisma';
import {getAiRawResponse, getAiTitle} from '../services/gemini.service';
import {AiResponseSchema, SYSTEM_PROMPT} from '../services/ai.service';
import {deleteSession, getHistoryForSession, listSessionsByProjectId} from "../services/history.service";


/**
 * Handle requests to create new sessions
 * @param req
 * @param res
 * @param next
 */
export const handleCreateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {projectId} = req.params;
    const {content} = req.body;

    if (!content) {
        ResponseHandler.error(res, '`content` is required to start a new session.', 400);
        return;
    }

    try {
        // Execute AI calls in parallel: one generates the header and one generates the initial UI response
        console.log("[Create Session] Start parallel AI calls for title and initial response.");
        const [title, rawResponseText] = await Promise.all([
            getAiTitle(content),
            getAiRawResponse([], SYSTEM_PROMPT)
        ]);
        console.log("[Create Session] Parallel AI calls finished.");

        // Validate the primary AI response
        const validatedResponse = AiResponseSchema.parse(JSON.parse(rawResponseText));

        // All records are created atomically using database transactions
        const newSessionId = uuidv4();

        console.log(`[Create Session] Starting DB transaction for new session: ${newSessionId}`);
        const newSession = await prisma.$transaction(async (tx) => {
            const session = await tx.session.create({
                data: {
                    id: newSessionId,
                    projectId: projectId,
                    title: title,
                }
            });

            // Create a message record for the user
            await tx.message.create({
                data: {
                    sessionId: newSessionId,
                    role: 'user',
                    content: content,
                }
            });

            // Create a response record of the AI model (including structured data)
            await tx.message.create({
                data: {
                    sessionId: newSessionId,
                    role: 'model',
                    content: rawResponseText,
                    userMessage: validatedResponse.userMessage,
                    projectData: validatedResponse.data ?? undefined,
                }
            });

            return session;
        });
        console.log("[Create Session] DB transaction successful.");

        // assemble and return a final, initial response with all initialization information
        ResponseHandler.success(res, {
            ...validatedResponse,
            newSession: newSession
        }, 'New session created successfully.');

    } catch (error) {
        // If any of the steps fail, the error is passed to the global error handler
        console.error("[Create Session] An error occurred during new session creation:", error);
        next(error);
    }
};


/**
 * Handles requests to get a list of all sessions under a project
 */
export const handleListSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {projectId} = req.params;
    try {
        const sessions = await listSessionsByProjectId(projectId);
        ResponseHandler.success(res, sessions);
    } catch (error) {
        next(error);
    }
};

/**
 * Handle requests to get detailed message history for a single session
 */
export const handleGetSessionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {sessionId} = req.params;
    try {
        const messages = await getHistoryForSession(sessionId);
        ResponseHandler.success(res, messages);
    } catch (error) {
        next(error);
    }
};

/**
 * Handle requests to delete individual sessions
 */
export const handleDeleteSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {sessionId} = req.params;
    try {
        await deleteSession(sessionId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
