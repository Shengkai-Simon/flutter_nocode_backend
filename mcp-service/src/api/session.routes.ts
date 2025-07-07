import { Router } from 'express';
import { handleNewMessage } from './session.controller';

const router = Router();

// Route the POST request to our controller function
router.post('/sessions/:sessionId/messages', handleNewMessage);

export default router;
