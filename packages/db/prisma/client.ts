import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from './generated/prisma/client'
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined');
}

export const prisma = new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL!,
}).$extends(withAccelerate())
