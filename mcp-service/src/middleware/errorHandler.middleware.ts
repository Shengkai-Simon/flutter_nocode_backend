import { Request, Response, NextFunction } from 'express';
import { ResponseHandler } from '../utils/response.util';

/**
 * Global error handling middleware
 * @param err - Error object
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 */
const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // Different status codes and messages can be returned based on the type of err (e.g., ZodError, PrismaError, etc.).
    console.error('[Global Error Handler]:', err.stack);

    // Default returns 500 Internal Server Error
    ResponseHandler.error(res, err.message || 'An unexpected error occurred.', 500);
};

export default errorHandler;
