import { PrismaClient } from '@prisma/client';

// Create a singleton of PrismaClient to ensure that the entire app shares the same instance
const prisma = new PrismaClient();

export default prisma;
