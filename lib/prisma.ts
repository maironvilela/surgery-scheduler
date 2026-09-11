/**
 * lib/prisma.ts
 *
 * Exporta o cliente Prisma correto conforme o ambiente:
 *  - PREVIEW=true  →  SQLite in-memory (banco local temporário, sem tocar em produção)
 *  - padrão        →  PostgreSQL (banco de produção)
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

function createPrismaClient() {
    const connectionString = process.env.DATABASE_URL
    const pool = new Pool({
        connectionString,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
    })
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

export default prisma
