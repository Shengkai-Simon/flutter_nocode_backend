import { NextFunction, Request, Response } from 'express';
import { ResponseHandler } from '../utils/response.util';
import { listSessionsByProjectId } from '../services/history.service';
import { createNewSession, createSessionFromAdjustment } from '../services/project.service';


/**
 * Handle requests to create a new session from scratch。
 * POST /projects/:projectId/sessions/create
 */
export const handleCreateSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { projectId } = req.params;
        const { content } = req.body;

        if (!content) {
            ResponseHandler.error(res, '`content` is required to start a new session.', 400);
            return;
        }

        // Call a service function with clear intent
        const { newSession, validatedResponse } = await createNewSession(projectId, content);

        ResponseHandler.success(res, {
            ...validatedResponse,
            newSession: newSession
        }, 'New session created successfully.');

    } catch (error) {
        console.error("[Project Controller] An error occurred while creating a session:", error);
        next(error);
    }
};

/**
 * Handles requests that are adjusted based on an existing layout to create a new session。
 * POST /projects/:projectId/sessions/adjust
 */
export const handleAdjustSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { projectId } = req.params;
        const { content, jsonLayout } = req.body;

        if (!content || !jsonLayout) {
            ResponseHandler.error(res, '`content` and `jsonLayout` are required for an adjustment.', 400);
            return;
        }

        // Call a service function with clear intent
        const { newSession, validatedResponse } = await createSessionFromAdjustment(projectId, content, jsonLayout);

        ResponseHandler.success(res, {
            ...validatedResponse,
            newSession: newSession
        }, 'New session created from adjustment successfully.');

    } catch (error) {
        console.error("[Project Controller] An error occurred while adjusting a session:", error);
        next(error);
    }
};


/**
 * Handles requests to get a list of all sessions under a project.
 * GET /projects/:projectId/sessions
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
