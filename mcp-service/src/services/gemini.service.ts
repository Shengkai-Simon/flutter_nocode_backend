import { Content, GenerationConfig, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const generationConfig: GenerationConfig = { responseMimeType: "application/json" };
const safetySettings = [
    { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
    { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig, safetySettings });

export const getAiTitle = async (initialContent: string): Promise<string> => {
    const titleGenModel = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: "text/plain" },
        safetySettings
    });
    const prompt = `Based on the following user request, generate a short, concise title of no more than 10 words... \n\nUser Request:"""\n${initialContent}\n"""`;
    try {
        const result = await titleGenModel.generateContent(prompt);
        const title = result.response.text().trim();
        return title || "New Conversation";
    } catch (error) {
        console.error("[AI Title Service] Failed to generate title:", error);
        return "New Conversation";
    }
};


/**
 * Call the Gemini API directly and return the original text response.
 * @param finalContents - A final Content array that has been built by the PromptService.
 * @returns Raw string response from AI.
 */
export const getAiRawResponse = async (finalContents: Content[]): Promise<string> => {
    console.log(`[Gemini Service] Sending final payload to Gemini API: ${finalContents}`);
    try {
        const result = await model.generateContent({ contents: finalContents });
        return result.response.text();
    } catch (error) {
        console.error("\n[ERROR] Gemini API call failed:", error);
        throw error;
    }
};
