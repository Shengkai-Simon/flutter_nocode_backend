import { Request, Response, NextFunction } from 'express';
import { listSessionsByProjectId, getHistoryForSession, deleteSession } from '../services/history.service';
import { ResponseHandler } from '../utils/response.util';

/**
 * Handles requests to get a list of all sessions under a project
 */
export const handleListSessions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { projectId } = req.params;
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
    const { sessionId } = req.params;
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
    const { sessionId } = req.params;
    try {
        await deleteSession(sessionId);
        res.status(204).send();
    } catch (error) {
        next(error);
    }
};
