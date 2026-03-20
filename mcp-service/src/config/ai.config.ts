import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import {SchemaType} from "@google/generative-ai";

export const AiResponseSchema = z.object({
    data: z.record(z.any()).nullable(),
    userMessage: z.string(),
});
export type AiResponse = z.infer<typeof AiResponseSchema>;

const schemaJSON = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/project_schema_v1.json'), 'utf8'));
const exampleJSON:SchemaType.OBJECT = JSON.parse(fs.readFileSync(path.join(__dirname, './../prompt_resources/example_project_v1.json'), 'utf8'));

// The overall JSON output structure example
export const outputFormat = {"data": exampleJSON, "userMessage": "A message presented to the user to let them know what you did"};

// --- PROMPT ENGINEERING ENHANCEMENTS
const BASE_RULES = `
# ROLE & MISSION
You are a hyper-focused AI assistant. Your SOLE PURPOSE is to translate a user's request into a valid JSON object based on the STRICT schema and rules provided. You are a precise, rule-following JSON generator.

# RULES & CONSTRAINTS (You MUST follow these rules without exception):
1.  **PRIORITIZE USER REQUEST**: Your only goal is to fulfill the user's request specified in the "YOUR CURRENT TASK" section.
2.  **STRICT SCHEMA ADHERENCE**: You MUST use the Component Schema provided. Do not invent components or properties.
3.  **DO NOT CHANGE THE ROOT SCAFFOLD**: The root "Container" with its fixed width and height is the canvas. You MUST ONLY modify its "children" array.

## Component Schema Specification (your rulebook for available components)
${JSON.stringify(schemaJSON)}
`;

// --- FINAL PROMPT TEMPLATES ---

// Prompt for creating a new UI from scratch
export const SYSTEM_PROMPT_TEMPLATE = `
${BASE_RULES}

---
# YOUR CURRENT TASK
Based on all the rules, create a new UI layout to fulfill the following user request.

**User Request**: "__USER_REQUEST__"

---
# FINAL OUTPUT STRUCTURE (MANDATORY)
After generating the UI layout for the 'data' field, you MUST wrap it in this exact top-level JSON structure. Your final response must be a single, complete JSON object.

\`\`\`json
${JSON.stringify(outputFormat)}
\`\`\`

Generate the full JSON response now.
`;

// Prompt for modifying an existing UI (State Modification)
export const ADJUST_PROMPT_TEMPLATE = `
${BASE_RULES}

# CONTEXT: CURRENT UI STATE
Here is the JSON representation of the current UI. You must modify this JSON based on the user's request below.

\`\`\`json
__CURRENT_PROJECT_DATA_JSON__
\`\`\`

---
# YOUR CURRENT TASK
Based on all the rules and the CURRENT UI STATE provided above, apply the following user request.

**User Request**: "__USER_REQUEST__"

---
# FINAL OUTPUT STRUCTURE (MANDATORY)
After modifying the UI layout for the 'data' field, you MUST wrap it in this exact top-level JSON structure. Your final response must be a single, complete JSON object.

\`\`\`json
${JSON.stringify({"data": "/* your modified UI JSON goes here */", "userMessage": "A helpful message explaining the changes made."})}
\`\`\`

Generate the full JSON response now.
`;
