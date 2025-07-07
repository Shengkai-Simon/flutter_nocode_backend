import prisma from '../config/prisma';
import {Message, Session} from '@prisma/client';

// Define the types of message roles we need to ensure consistency
type MessageRole = 'user' | 'model' | 'system';


/**
 * Get a list of all sessions under it based on projectId
 * @param projectId - The ID of the project
 * @returns Returns an array of sessions in descending order of creation time
 */
export const listSessionsByProjectId = async (projectId: string): Promise<Session[]> => {
    try {
        return await prisma.session.findMany({
            where: {
                projectId: projectId,
            },
            orderBy: {
                createdAt: 'desc', // In reverse chronological order, the most recent session comes first
            },
        });
    } catch (error) {
        console.error(`Error fetching sessions for project ${projectId}:`, error);
        throw new Error('Failed to fetch sessions for the project.');
    }
};

/**
 * Deletes a conversation and all of its associated messages
 * @param sessionId - The ID of the session to be deleted
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
    try {
        // Because of the constraints between Message and Session,
        // we need to delete the message and then the conversation in a transaction
        await prisma.$transaction([
            prisma.message.deleteMany({
                where: { sessionId: sessionId },
            }),
            prisma.session.delete({
                where: { id: sessionId },
            }),
        ]);
    } catch (error) {
        console.error(`Error deleting session ${sessionId}:`, error);
        throw new Error('Failed to delete session.');
    }
}

/**
 * Find or create a new session.
 * @param sessionId - The session ID that we want to find or create
 * @param projectId - The ID of the project to which the session belongs
 * @returns Returns found or newly created session objects
 */
export const findOrCreateSession = async (sessionId: string, projectId: string): Promise<Session> => {
    try {
        return await prisma.session.upsert({
            where: {id: sessionId},
            update: {},
            create: {
                id: sessionId,
                projectId: projectId,
                title: 'New Conversation',
            },
        });
    } catch (error) {
        console.error(`Error finding or creating session ${sessionId}:`, error);
        throw new Error('Failed to find or create session.');
    }
}

/**
 * Get all historical messages based on session ID
 * @param sessionId - Sessional UUID
 * @returns Returns an array of messages in ascending chronological order
 */
export const getHistoryForSession = async (sessionId: string): Promise<Message[]> => {
    try {
        return await prisma.message.findMany({
            where: {
                sessionId: sessionId,
            },
            orderBy: {
                createdAt: 'asc', // Make sure the history is chronological
            },
        });
    } catch (error) {
        console.error(`Error fetching history for session ${sessionId}:`, error);
        throw new Error('Failed to fetch session history.');
    }
};

/**
 * Add a new message to the specified meeting ID
 * @param sessionId - sessional UUID
 * @param role - The role of the message ('user', 'model', 'system')
 * @param content - The content of the message
 * @returns Returns the newly created message object
 */
export const addMessageToHistory = async (sessionId: string, role: MessageRole, content: string): Promise<Message> => {
    try {
        return await prisma.message.create({
            data: {
                sessionId: sessionId,
                role: role,
                content: content,
            },
        });
    } catch (error) {
        console.error(`Error adding message to session ${sessionId}:`, error);
        throw new Error('Failed to add message to history.');
    }
};
