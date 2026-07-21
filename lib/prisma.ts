import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const connectionString =
        process.env.DATABASE_URL ||
        'postgresql://postgres:postgres@localhost:5432/agenda?schema=public'

    const pool = new Pool({ connectionString })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

export default prisma
