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

export const getAiRawResponse = async (dbHistory: Message[], SYSTEM_PROMPT: string): Promise<string> => {

    console.log("\n[LOG 1] RECEIVED DB HISTORY FOR THIS TURN:", JSON.stringify(dbHistory, null, 2));

    const finalContents: Content[] = [
        {
            role: 'user',
            parts: [{ text: SYSTEM_PROMPT }]
        },
    ];

    // Iterate through the history taken out of the database and transform based on role
    dbHistory.forEach(message => {
        if (message.role === 'system') {
            // Convert the system message to a prefixed user message
            finalContents.push({
                role: 'user',
                parts: [{ text: `[SYSTEM FEEDBACK]:\n${message.content}` }]
            });
        } else {
            // user and model messages are added directly
            finalContents.push({
                role: message.role as ('user' | 'model'),
                parts: [{ text: message.content }]
            });
        }
    });


    console.log("\n[LOG 2] FINAL PAYLOAD BEING SENT TO GEMINI:", JSON.stringify(finalContents, null, 2));

    try {
        const result = await model.generateContent({
            contents: finalContents,
        });
        const responseText = result.response.text();
        console.log("\n[LOG 3] RAW TEXT RESPONSE FROM GEMINI:\n", responseText);
        return responseText;
    } catch (error) {
        console.error("\n[ERROR] Gemini API call failed:", error);
        throw error;
    }
};
