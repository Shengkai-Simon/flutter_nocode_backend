import prisma from '../config/prisma';
import {Message, Prisma, Session} from '@prisma/client';

// Define the types of message roles we need to ensure consistency
type MessageRole = 'user' | 'model' | 'system';

/**
 * Lookup the session based on the ID and throw an error if it doesn't exist
 * @param sessionId - The ID of the session to be found
 * @returns Returns the found session object
 * @throws If the session does not exist, an error with a specific message is thrown
 */
export const findSessionById = async (sessionId: string): Promise<Session> => {
    const session = await prisma.session.findUnique({
        where: { id: sessionId },
    });

    if (!session) {
        // This error is caught by the global error handler and returned to the client with a standard 404 response
        const error = new Error(`Session Id: ${sessionId} does not exist.`);
        // Attach a status code so that the global error handler can return a 404
        (error as any).statusCode = 404;
        throw error;
    }
    return session;
};

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
    // Verify that the session exists before deleting it
    await findSessionById(sessionId);

    try {
        await prisma.$transaction([
            prisma.message.deleteMany({ where: { sessionId: sessionId } }),
            prisma.session.delete({ where: { id: sessionId } }),
        ]);
    } catch (error) {
        console.error(`Error deleting session ${sessionId}:`, error);
        throw new Error('Failed to delete session.');
    }
};

/**
 *  Get all historical messages based on session ID
 *  @param sessionId - The UUID of the session
 *  @returns Returns an array of messages in ascending chronological order
 */
export const getHistoryForSession = async (sessionId: string): Promise<Message[]> => {
    // Verify that the session exists before performing any action
    await findSessionById(sessionId);

    try {
        return await prisma.message.findMany({
            where: {sessionId: sessionId},
            orderBy: {createdAt: 'asc'},
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
 * @param options - An object that contains optional structured data
 * @returns Returns the newly created message object
 */
export const addMessageToHistory = async (
    sessionId: string,
    role: MessageRole,
    content: string,
    options?: {
        userMessage?: string;
        projectData?: Prisma.JsonValue;
    }
): Promise<Message> => {
    try {
        let finalContent = content;

        // If it's a model role and you have projectData, content is a formatted JSON string
        if (role === 'model' && options?.projectData) {
            try {
                // Parse the original content and then re-stringify it into an unformatted string
                const parsedObject = JSON.parse(content);
                finalContent = JSON.stringify(parsedObject);
                console.log('[History Service] Minified model content before saving to DB.');
            } catch (e) {
                // If parsing fails, the original, uncompressed content is still saved in case of data loss
                console.warn('[History Service] Could not minify model content, saving raw version.');
            }
        }

        return await prisma.message.create({
            data: {
                sessionId: sessionId,
                role: role,
                content: finalContent, // Use processed content
                userMessage: options?.userMessage,
                projectData: options?.projectData ?? undefined,
            },
        });
    } catch (error) {
        console.error(`Error adding message to session ${sessionId}:`, error);
        throw new Error('Failed to add message to history.');
    }
};
