import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'
import { withAccelerate } from '@prisma/extension-accelerate'

export default defineConfig({
    schema: 'prisma/schema.prisma',
    migrations: {
        path: 'prisma/migrations',
    },
    datasource: {
        url: env('DATABASE_URL'),
    },
})