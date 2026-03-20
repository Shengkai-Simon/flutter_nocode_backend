import { Router } from 'express';
import {handleAddMessage, handleDeleteSession, handleGetSessionHistory} from './session.controller';

const router = Router();

// Route the POST request to our controller function
router.post('/sessions/:sessionId/messages', handleAddMessage);

// Get the message history for a specific session
router.get('/sessions/:sessionId/messages', handleGetSessionHistory);

// Delete a session
router.delete('/sessions/:sessionId', handleDeleteSession);

export default router;
