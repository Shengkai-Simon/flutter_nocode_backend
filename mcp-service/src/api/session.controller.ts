import { Request, Response, NextFunction } from 'express';
import { deleteSession, getHistoryForSession } from '../services/history.service';
import { ResponseHandler } from '../utils/response.util';
import { addMessageAndGetValidatedResponse } from '../services/session.service';

/**
 * Handle requests to add new messages to an existing conversation
 */
export const handleAddMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const sessionId = req.params.sessionId as string;
        const { content } = req.body;

        if (!content) {
            ResponseHandler.error(res, '`content` is required.', 400);
            return;
        }

        const validatedResponse = await addMessageAndGetValidatedResponse(sessionId, content);

        ResponseHandler.success(res, validatedResponse);

    } catch (error) {
        next(error);
    }
};

/**
 * Handle requests to get detailed message history for a single session
 */
export const handleGetSessionHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const sessionId = req.params.sessionId as string;
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
    const sessionId = req.params.sessionId as string;
    try {
        await deleteSession(sessionId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
