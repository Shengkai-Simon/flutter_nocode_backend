import { Request, Response, NextFunction } from 'express';
import { findOrCreateSession, addMessageToHistory } from '../services/history.service';
import { ResponseHandler } from '../utils/response.util';
import { getValidatedAiResponseWithRetry } from '../services/ai.service';

/**
 * Handle requests to add new messages to existing conversations
 */
export const handleNewMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { sessionId } = req.params;
        const { content, projectId } = req.body;

        if (!content || !projectId) {
            ResponseHandler.error(res, '`content` and `projectId` are required.', 400);
            return;
        }

        // 2. Make sure the session exists
        await findOrCreateSession(sessionId, projectId);

        // 3. Add the user's messages to the history
        await addMessageToHistory(sessionId, 'user', content);

        // 4. Invoke the encapsulated AI service to get a verified response
        console.log(`[Session Controller] Calling AI Service for session ${sessionId}...`);
        const validatedResponse = await getValidatedAiResponseWithRetry(sessionId);
        console.log(`[Session Controller] AI Service returned a validated response for session ${sessionId}.`);

        // 5. Returns a successful response
        ResponseHandler.success(res, validatedResponse);

    } catch (error) {
        // If the AI service eventually throws an error, the global error handler catches it
        next(error);
    }
};
