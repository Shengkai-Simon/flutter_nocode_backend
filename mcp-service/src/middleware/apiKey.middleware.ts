import {NextFunction, Request, Response} from 'express';
import {ResponseHandler} from '../utils/response.util';

// Read the primary and standby keys from environment variables
const PRIMARY_API_KEY = process.env.INTERNAL_API_KEY_PRIMARY;
const SECONDARY_API_KEY = process.env.INTERNAL_API_KEY_SECONDARY;

const verifyInternalApiKey = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // The master key is mandatory, and if it is not set, it is a critical misconfiguration
    if (!PRIMARY_API_KEY) {
        console.error('CRITICAL: INTERNAL_API_KEY_PRIMARY is not set in environment variables.');
        ResponseHandler.error(res, 'Internal server configuration error.', 500);
        return;
    }

    const requestApiKey = req.headers['x-internal-api-key'] as string;

    // 1. Check whether the master key is matched
    if (requestApiKey && requestApiKey === PRIMARY_API_KEY) {
        return next(); // Verified passed
    }

    // 2. If the master key does not match, check if there is a standby key and if the standby key is matched
    if (SECONDARY_API_KEY && requestApiKey && requestApiKey === SECONDARY_API_KEY) {
        return next(); // Verified passed
    }

    // If none match, access is denied
    ResponseHandler.error(res, 'Unauthorized: Invalid or missing API Key.', 401);
    return;
};

export default verifyInternalApiKey;
