import { z } from 'zod';

/**
 * Defines the interface for the action function that needs to be retried。
 * It receives an optional "remediation" message.
 */
type Action<T> = (correctionMessage?: string) => Promise<T>;

/**
 * The interface for the validation function is defined。
 * It receives the return value of the action function and should throw an error if the validation fails.
 */
type Validator<T> = (result: T) => void;

/**
 * Defines the function interface used to generate a remediation message when a retry occurs.
 */
type CorrectionMessageGenerator<T> = (result: T, error: any) => string;

interface RetryOptions<T> {
    action: Action<T>;
    validate: Validator<T>;
    generateCorrectionMessage: CorrectionMessageGenerator<T>;
    maxRetries?: number;
}

/**
 * A general-purpose, robust retry tool function.
 * It encapsulates the core logic of "execute-verify-retries".
 *
 * @param options.action - An asynchronous function that returns a Promise is the core operation that needs to be performed.
 * @param options.validate - A synchronous function that verifies the result of the 'action'. If the validation fails, it should throw an error.
 * @param options.generateCorrectionMessage - A function that generates a correction instruction when validation fails.
 * @param options.maxRetries - The maximum number of retries, which is 3 by default.
 * @returns Returns a successfully validated 'action' result.
 * @throws If it still fails after all retries, a final error is thrown.
 */
export const withRetry = async <T>(options: RetryOptions<T>): Promise<T> => {
    const { action, validate, generateCorrectionMessage, maxRetries = 3 } = options;

    let retries = maxRetries;
    let lastError: any = null;
    let correctionMessage: string | undefined;

    while (retries > 0) {
        try {
            // Perform core operations and pass in possible remediation instructions
            const result = await action(correctionMessage);

            // Verify the results
            validate(result);

            // If the verification is successful, the result is returned
            console.log(`[Retry Util] Action and validation succeeded.`);
            return result;

        } catch (error) {
            retries--;
            lastError = error;
            const rawResult = (error as any).rawData;

            console.warn(`[Retry Util] Action or validation failed. Reason: ${lastError.message}. Retries left: ${retries}`);

            if (retries > 0) {
                // Generate a remediation message for the next retries
                correctionMessage = generateCorrectionMessage(rawResult, lastError);
            }
        }
    }

    // After all retries have been exhausted, an error is thrown with the reason for the eventual failure
    throw new Error(`Action failed after ${maxRetries} retries. Last error: ${lastError.message}`);
};
