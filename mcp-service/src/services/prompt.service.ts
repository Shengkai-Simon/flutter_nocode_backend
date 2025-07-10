import { Content } from '@google/generative-ai';
import { SYSTEM_PROMPT_TEMPLATE, ADJUST_PROMPT_TEMPLATE } from '../config/ai.config';

/**
 * Builds the final prompt payload for the Gemini AI using the "State Modification" approach.
 * It no longer sends conversation history, focusing only on the current state and the new request.
 *
 * @param latestUserContent - The most recent message content from the user.
 * @param projectJsonState - [Optional] The current UI layout JSON. If not provided, it's a 'CREATE' task.
 * @returns A complete Content[] array ready for the Gemini API.
 */
export const buildFinalPrompt = (
    latestUserContent: string,
    projectJsonState?: object
): Content[] => {
    let finalPromptText: string;

    // 1. Determine if this is a 'CREATE' or 'ADJUST' task based on the presence of a project state.
    const isEmptyObject =
        !projectJsonState ||
        (typeof projectJsonState === 'object' && Object.keys(projectJsonState).length === 0);
    if (!isEmptyObject) {
        // This is an "ADJUST" task. We have a current state to modify.
        const projectDataJsonString = JSON.stringify(projectJsonState); // Pretty-print for AI readability
        finalPromptText = ADJUST_PROMPT_TEMPLATE
            .replace('__CURRENT_PROJECT_DATA_JSON__', projectDataJsonString)
            .replace('__USER_REQUEST__', latestUserContent);
    } else {
        // This is a "CREATE" task. No prior state exists.
        finalPromptText = SYSTEM_PROMPT_TEMPLATE.replace('__USER_REQUEST__', latestUserContent);
    }

    // 2. The entire prompt is a single, focused 'user' message to the AI.
    //    We are NOT sending any previous conversation history.
    const finalContents: Content[] = [{
        role: 'user',
        parts: [{ text: finalPromptText }]
    }];

    console.log("\n[Prompt Service] Built a focused 'State Modification' prompt. History is intentionally omitted.");
    // For debugging: console.log("\n[LOG] FINAL PAYLOAD:", JSON.stringify(finalContents));

    return finalContents;
};
