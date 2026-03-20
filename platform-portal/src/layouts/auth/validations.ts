import * as z from "zod";

/**
 * A reusable Zod schema for password validation.
 * Ensures that the password meets the application's security requirements.
 */
export const passwordValidation = z.string()
    .min(8, {message: "Password must be at least 8 characters long."})
    .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {message: "Password must contain at least one letter and one number."})
    .regex(/^[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]*$/, {message: "Password contains invalid characters."});

