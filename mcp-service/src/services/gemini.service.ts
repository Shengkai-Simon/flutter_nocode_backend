import {Message} from '@prisma/client';
import {
    Content,
    GenerationConfig,
    GoogleGenerativeAI,
    HarmBlockThreshold,
    HarmCategory,
} from '@google/generative-ai';

// Gemini Client initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const generationConfig: GenerationConfig = {
    responseMimeType: "application/json",
};
const safetySettings = [
    {category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE},
    {category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE},
    {category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE},
    {category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE},
];

// https://ai.google.dev/gemini-api/docs/models
const model = genAI.getGenerativeModel({model: 'gemini-2.5-flash', generationConfig, safetySettings});

/**
 * Based on the initial input of the user, the AI is invoked to generate a short session title
 * @param initialContent - The content of the user's first question
 * @returns Returns a string header
 */
export const getAiTitle = async (initialContent: string): Promise<string> => {
    // Lightweight model configuration specifically designed for titles
    const titleGenModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        // For plain text titles, we don't need JSON output
        generationConfig: { responseMimeType: "text/plain" },
        safetySettings
    });

    const prompt = `Based on the following user request, generate a short, concise title of no more than 10 words. The headline needs to accurately summarize the user's core intent. Please return the title text directly and do not include any extra explanations or quotation marks.

User Request:"""
${initialContent}
"""`;

    try {
        const result = await titleGenModel.generateContent(prompt);
        const title = result.response.text().trim();
        console.log(`[AI Title Service] Generated Title: "${title}"`);
        // Returns a default header in case the AI returns an empty string
        return title || "New Conversation";
    } catch (error) {
        console.error("[AI Title Service] Failed to generate title:", error);
        // Returns a safe default value when generating a title fails
        return "New Conversation";
    }
};

export const getAiRawResponse = async (dbHistory: Message[], systemPromptTemplate: string): Promise<string> => {

    console.log("\n[LOG 1] RECEIVED DB HISTORY FOR THIS TURN:", JSON.stringify(dbHistory, null, 2));

    let latestProjectData: object | null = null;
    let lastModelMessageIndex: number = -1; // 1. The index used to record the last model message

    // --- Drill through backwards to find the index of the latest projectData and the last model message ---
    for (let i = dbHistory.length - 1; i >= 0; i--) {
        const message = dbHistory[i];
        if (message.role === 'model') {
            // If this is the first model message we find, record its index
            if (lastModelMessageIndex === -1) {
                lastModelMessageIndex = i;
                console.log(`[Robust Find] Found last model message at index: ${lastModelMessageIndex}`);
            }
            // If the projectData hasn't been found and the current message is available, log it
            if (!latestProjectData && message.projectData) {
                latestProjectData = message.projectData as object;
                console.log("[Robust Find] Found latest projectData from a model message.");
            }
            // If both are found, you can exit the loop early
            if (lastModelMessageIndex !== -1 && latestProjectData) {
                break;
            }
        }
    }

    // Build dynamic system prompts
    const projectDataJsonString = latestProjectData
        ? JSON.stringify(latestProjectData, null, 2)
        : "The current project is empty, please create a completely new UI structure according to the user's needs.";
    const finalSystemPrompt = systemPromptTemplate.replace('__CURRENT_PROJECT_DATA_JSON__', projectDataJsonString);

    const finalContents: Content[] = [{
        role: 'user',
        parts: [{ text: finalSystemPrompt }]
    }];

    // --- Construct conversation history in positive order and use the found index to make judgments ---
    dbHistory.forEach((message, index) => {
        switch (message.role) {
            case 'user':
                finalContents.push({ role: 'user', parts: [{ text: message.content }] });
                break;

            case 'model':
                // Determine whether the index of the current message is the index of the last model message
                if (index === lastModelMessageIndex) {
                    console.log(`[Hybrid Token Strategy] Including FULL content for the model message at index ${index}.`);
                    finalContents.push({
                        role: 'model',
                        parts: [{ text: message.content }]
                    });
                } else {
                    // For older AI responses, only the userMessage is included
                    if (message.userMessage) {
                        finalContents.push({
                            role: 'model',
                            parts: [{ text: JSON.stringify({ userMessage: message.userMessage }) }]
                        });
                    }
                }
                break;

            case 'system':
                // Ignore the system message
                break;
        }
    });

    console.log("\n[LOG 2] FINAL (Robustly Optimized) PAYLOAD:", JSON.stringify(finalContents, null, 2));

    try {
        const result = await model.generateContent({ contents: finalContents });
        return result.response.text();
    } catch (error) {
        console.error("\n[ERROR] Gemini API call failed:", error);
        throw error;
    }
};
