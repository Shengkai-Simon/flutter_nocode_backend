import * as z from "zod";

/**
 * Zod schema for project name validation.
 * - Min length: 1
 * - Max length: 20
 * - Allowed characters: letters, numbers, spaces, and common punctuation.
 */
const projectNameValidation = z.string({
    required_error: "Project name cannot be empty.",
})
    .min(1, { message: "Project name cannot be empty." })
    .max(20, { message: "Project name must be between 1 and 20 characters long." })
    .regex(/^[a-zA-Z0-9_\-\s.,!?']+$/, { message: "Project name contains invalid characters." });

/**
 * Zod schema for project description validation.
 * - Max length: 500
 * - Allows a wide range of characters including newlines.
 * - Optional field.
 */
const projectDescriptionValidation = z.string()
    .max(500, { message: "Description cannot exceed 500 characters." })
    .regex(/^[\w\s.,!?'"()\-\–—*@#:/\\n]*$/, { message: "Description contains invalid characters." })
    .optional();

/**
 * Combined Zod schema for the project creation and editing form.
 */
export const projectFormSchema = z.object({
    name: projectNameValidation,
    description: projectDescriptionValidation,
});
