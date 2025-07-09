import { Message, SessionType } from '@prisma/client';
import { Content } from '@google/generative-ai';
import { SYSTEM_PROMPT, ADJUST_PROMPT } from '../config/ai.config';

/**
 * Conversation History Processing Policy:
 * In order to optimize the use of tokens and maintain context, we have streamlined historical messages.
 * The strategy is as follows:
 * - Keep all 'user' and 'system' messages.
 * - For 'model' messages, only the last one is kept intact.
 * - For older 'model' messages, if they contain 'userMessage', convert them to a simplified JSON string,
 * This way the AI will still know what it has said to the user before, but it won't need to keep a huge 'projectData'.
 * * @param dbHistory - The history of the original messages obtained from the database
 * @returns Returns a condensed array of message history suitable for sending to AI
 */
const processHistoryForAi = (dbHistory: Message[]): Content[] => {
    const processedContents: Content[] = [];
    let lastModelMessageIndex = -1;

    // Locate the index of the last 'model' message from back to front
    for (let i = dbHistory.length - 1; i >= 0; i--) {
        if (dbHistory[i].role === 'model') {
            lastModelMessageIndex = i;
            break;
        }
    }

    dbHistory.forEach((message, index) => {
        switch (message.role) {
            case 'user':
                processedContents.push({ role: 'user', parts: [{ text: message.content }] });
                break;
            case 'system':
                // The system message is usually a correction instruction for the AI and is directly retained
                if (index === dbHistory.length - 1) {
                    processedContents.push({ role: 'user', parts: [{ text: message.content }] });
                }
                break;
            case 'model':
                if (index === lastModelMessageIndex) {
                    // For the last model message, keep the content intact
                    processedContents.push({
                        role: 'model',
                        parts: [{ text: message.content }]
                    });
                } else {
                    // For the previous model message, make it refined
                    if (message.userMessage) {
                        processedContents.push({
                            role: 'model',
                            parts: [{ text: JSON.stringify({ userMessage: message.userMessage }) }]
                        });
                    }
                }
                break;
        }
    });

    return processedContents;
};


/**
 * Build the final Prompt (Content[] array) to be sent to Gemini AI.
 * This function encapsulates all the logic related to Prompt.
 *
 * @param history - The original session history obtained from the database.
 * @param sessionType - THE SESSION TYPE ('CREATE' OR 'ADJUST').
 * @param initialProjectData - [OPTIONAL] FOR THE INITIAL PROJECT JSON OF TYPE 'ADJUST'.
 * @returns Returns the Content[] array that was built and sent directly to the Gemini API.
 */
export const buildFinalPrompt = (
    history: Message[],
    sessionType: SessionType,
    initialProjectData?: object
): Content[] => {

    let systemPrompt: string;

    // 1. Select and build system prompts based on the session type
    if (sessionType === SessionType.ADJUST && initialProjectData) {
        // For the 'ADJUST' type, you need to inject the current project data into the Prompt template
        const projectDataJsonString = JSON.stringify(initialProjectData);
        systemPrompt = ADJUST_PROMPT.replace('\"__CURRENT_PROJECT_DATA_JSON__\"', projectDataJsonString);
    } else {
        // For 'CREATE' type or cases where there is no initial data, use a standard Prompt
        systemPrompt = SYSTEM_PROMPT;
    }

    // 2. Use system prompts as the beginning of the entire conversation
    const finalContents: Content[] = [{
        role: 'user', // The prompt is usually the first 'user' message in the Gemini API
        parts: [{ text: systemPrompt }]
    }];

    // 3. Process and attach historical messages
    const processedHistory = processHistoryForAi(history);
    finalContents.push(...processedHistory);

    console.log("\n[Prompt Service] Successfully built final prompt payload.");
    console.log("\n[LOG] FINAL PAYLOAD:", JSON.stringify(finalContents));

    return finalContents;
};
