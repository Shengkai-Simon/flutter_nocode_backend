import { Router } from 'express';
import {
    handleCreateSession,
    handleAdjustSession,
    handleListSessions
} from './project.controller';

const router = Router();


// Create a new session from scratch
router.post('/projects/:projectId/sessions/create', handleCreateSession);

// Based on the existing layout adjustments, create a new session
router.post('/projects/:projectId/sessions/adjust', handleAdjustSession);

// Get all sub-sessions under a resource
router.get('/projects/:projectId/sessions', handleListSessions);

export default router;
