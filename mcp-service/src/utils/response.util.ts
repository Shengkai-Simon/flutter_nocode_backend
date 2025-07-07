import { Response } from 'express';

/**
 * A utility class that encapsulates standard API responses
 */
export class ResponseHandler {
    /**
     * Send a standard success response
     * @param res - Express Response Object
     * @param data - Business data to be sent
     * @param message - Success message
     * @param statusCode - HTTP Status Code (Default 200)
     */
    public static success(
        res: Response,
        data: any,
        message: string = 'Success',
        statusCode: number = 200
    ): Response {
        return res.status(statusCode).json({
            success: true,
            code: statusCode,
            message,
            data,
        });
    }

    /**
     * Send a standard failure response
     * @param res - Express Response Object
     * @param message - Error messages
     * @param statusCode -HTTP Status Code (Default 500)
     */
    public static error(
        res: Response,
        message: string,
        statusCode: number = 500
    ): Response {
        return res.status(statusCode).json({
            success: false,
            code: statusCode,
            message,
            data: null,
        });
    }
}
