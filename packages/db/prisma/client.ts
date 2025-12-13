import { withAccelerate } from '@prisma/extension-accelerate'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })

export const prisma = new PrismaClient({
    //accelerateUrl: process.env.DATABASE_URL!,
    adapter,
}).$extends(withAccelerate())