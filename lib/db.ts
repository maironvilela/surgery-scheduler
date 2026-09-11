/**
 * lib/db.ts  ← USE ESTE ARQUIVO em vez de importar lib/prisma.ts diretamente
 *
 * Ponto único de acesso ao banco de dados.
 * Controlado pela variável PREVIEW_DB:
 *
 *   PREVIEW_DB=true  →  SQLite in-memory (banco local, sem tocar na produção)
 *   (ausente)        →  PostgreSQL (banco de produção)
 *
 * NOTA: NODE_ENV não é usado aqui porque o Next.js sempre força
 *       NODE_ENV=development em `next dev`, tornando-o ineficaz.
 *
 * Uso:
 *   import db from '@/lib/db'
 *   const surgeries = await db.surgery.findMany()
 */

import { PrismaClient } from '@prisma/client'

import prisma from './prisma'

export default prisma
