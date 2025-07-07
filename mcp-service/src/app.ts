import express, { Application, Request, Response } from 'express';
import 'dotenv/config'; // Make sure the environment variables are loaded

import sessionRoutes from './api/session.routes';
import projectRoutes from './api/project.routes';

import errorHandler from './middleware/errorHandler.middleware';
import { ResponseHandler } from './utils/response.util';

const app: Application = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/health', (req: Request, res: Response) => {
    ResponseHandler.success(res, { status: 'OK', timestamp: new Date() });
});

app.use('/api/v1', sessionRoutes);
app.use('/api/v1', projectRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`MCP Service is running on port ${PORT}`);
});
