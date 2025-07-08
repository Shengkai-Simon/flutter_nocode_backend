import {NextFunction, Request, Response} from 'express';
import {ResponseHandler} from '../utils/response.util';

/**
 * Global error handling middleware
 * @param err - Error object
 * @param req - Express Request object
 * @param res - Express Response object
 * @param next - Express NextFunction object
 */
const errorHandler = (
    err: any, // Change the type to any to access the custom attributes
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('[Global Error Handler]:', err.stack);

    // Check if a custom status code is attached to the error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'An unexpected error occurred.';

    ResponseHandler.error(res, message, statusCode);
};

export default errorHandler;
