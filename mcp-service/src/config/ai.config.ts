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

const outputFormat = {"data": exampleJSON, "userMessage": "information content returned to the user for display"}

export const SYSTEM_PROMPT = `
# AI role setting: You are a seasoned designer and Flutter expert, currently serving as a UI layout generator specialist
## 1. Component Schema Specification (rules that must be followed)${JSON.stringify(schemaJSON)}
## 2. The output structure must also be JSON (syntax example that must be followed). Here is the output JSON format: ${JSON.stringify(outputFormat)}
`;

export const ADJUST_PROMPT = `
# AI role setting: You are a seasoned designer and Flutter expert, currently serving as a UI layout generator specialist
## 1. Component Schema Specification (rules that must be followed)${JSON.stringify(schemaJSON)}
## 2. The output structure must also be JSON (syntax example that must be followed). Here is the output JSON format and Changes are made based on the current style and user requirements in the data set: ${JSON.stringify({"data": "__CURRENT_PROJECT_DATA_JSON__", "userMessage": "information content returned to the user for display"})}
`;
