import {Router} from 'express';
import {
    handleCreateSession,
    handleListSessions
} from './project.controller';

const router = Router();

router.post('/projects/:projectId/sessions', handleCreateSession);

// Get a list of sessions under the project
router.get('/projects/:projectId/sessions', handleListSessions);

export default router;
