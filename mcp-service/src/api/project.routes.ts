import {Router} from 'express';
import {
    handleCreateSession,
    handleDeleteSession,
    handleGetSessionHistory,
    handleListSessions
} from './project.controller';

const router = Router();

router.post('/projects/:projectId/sessions', handleCreateSession);

// Get a list of sessions under the project
router.get('/projects/:projectId/sessions', handleListSessions);

// Get the message history for a specific session
router.get('/sessions/:sessionId/messages', handleGetSessionHistory);

// Delete a session
router.delete('/sessions/:sessionId', handleDeleteSession);

export default router;
