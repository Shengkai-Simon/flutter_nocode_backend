import express, { Application, Request, Response } from 'express';
import 'dotenv/config';

import sessionRoutes from './api/session.routes';
import projectRoutes from './api/project.routes';

import errorHandler from './middleware/errorHandler.middleware';
import verifyInternalApiKey  from './middleware/apiKey.middleware';

import { ResponseHandler } from './utils/response.util';

import eurekaClient from './config/eureka';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// This public health check endpoint does not need the API key
app.get('/health', (req: Request, res: Response) => {
    ResponseHandler.success(res, { status: 'UP', timestamp: new Date() });
});

app.use(verifyInternalApiKey)

app.use('/api', [sessionRoutes, projectRoutes]);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MCP Service is running on port ${PORT}`);
    eurekaClient.start(error => {
        if (error) {
            console.error('Eureka registration failed:', error);
        } else {
            console.log('Eureka client registered successfully.');
        }
    });
});

process.on('SIGINT', () => {
    eurekaClient.stop(() => {
        console.log('Eureka client stopped.');
        process.exit();
    });
});
