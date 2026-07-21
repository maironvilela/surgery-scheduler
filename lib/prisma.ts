import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import { PrismaPg } from '@prisma/adapter-pg'
import Database from 'better-sqlite3'
import { Pool } from 'pg'

/**
 * Banco de dados SQLite em memória (via arquivo temporário em /tmp).
 *
 * - Os dados NÃO são persistidos entre reinicializações do servidor.
 * - Usa o mesmo adapter better-sqlite3 já existente no projeto.
 * - O schema é criado automaticamente ao iniciar, sem necessidade de migrations.
 */

const DB_PATH = '/tmp/surgery-scheduler.db'

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined
}

function initSchema(db: InstanceType<typeof Database>) {
    db.pragma('foreign_keys = ON')
    db.exec(`
        CREATE TABLE IF NOT EXISTS "Doctor" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "crm" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "specialty" TEXT NOT NULL,
            "photoUrl" TEXT,
            "status" TEXT NOT NULL DEFAULT 'active',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Doctor_crm_key" ON "Doctor"("crm");

        CREATE TABLE IF NOT EXISTS "Hospital" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "cep" TEXT NOT NULL,
            "street" TEXT NOT NULL,
            "number" TEXT NOT NULL,
            "complement" TEXT,
            "neighborhood" TEXT NOT NULL,
            "city" TEXT NOT NULL,
            "state" TEXT NOT NULL,
            "referencePoint" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "HospitalContact" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "type" TEXT NOT NULL,
            "value" TEXT NOT NULL,
            "label" TEXT,
            "isPrimary" BOOLEAN NOT NULL DEFAULT false,
            "hospitalId" TEXT NOT NULL,
            CONSTRAINT "HospitalContact_hospitalId_fkey"
                FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "Patient" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "name" TEXT NOT NULL,
            "insurance" TEXT,
            "plan" TEXT,
            "birthDate" TEXT,
            "gender" TEXT NOT NULL DEFAULT 'other',
            "cep" TEXT,
            "street" TEXT,
            "number" TEXT,
            "complement" TEXT,
            "neighborhood" TEXT,
            "city" TEXT,
            "state" TEXT,
            "phone" TEXT,
            "email" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "Consultation" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "patientName" TEXT NOT NULL,
            "phone" TEXT,
            "status" TEXT NOT NULL DEFAULT 'Pendente',
            "time" TEXT NOT NULL,
            "whatsappSent" BOOLEAN NOT NULL DEFAULT false,
            "isArchived" BOOLEAN NOT NULL DEFAULT false,
            "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "insurance" TEXT,
            "observations" TEXT,
            "doctorId" TEXT,
            "hospitalId" TEXT,
            "patientId" TEXT,
            CONSTRAINT "Consultation_doctorId_fkey"
                FOREIGN KEY ("doctorId") REFERENCES "Doctor" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT "Consultation_hospitalId_fkey"
                FOREIGN KEY ("hospitalId") REFERENCES "Hospital" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT "Consultation_patientId_fkey"
                FOREIGN KEY ("patientId") REFERENCES "Patient" ("id") ON DELETE SET NULL ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "Surgery" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "patientId" TEXT NOT NULL,
            "patientName" TEXT NOT NULL,
            "doctorId" TEXT NOT NULL,
            "doctorName" TEXT NOT NULL,
            "hospitalId" TEXT NOT NULL,
            "hospitalName" TEXT NOT NULL,
            "procedure" TEXT NOT NULL,
            "date" TEXT NOT NULL,
            "startTime" TEXT NOT NULL,
            "endTime" TEXT NOT NULL,
            "room" TEXT NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'scheduled',
            "notes" TEXT,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS "Comment" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "user" TEXT NOT NULL,
            "date" TEXT NOT NULL,
            "content" TEXT NOT NULL,
            "surgeryId" TEXT NOT NULL,
            CONSTRAINT "Comment_surgeryId_fkey"
                FOREIGN KEY ("surgeryId") REFERENCES "Surgery" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "Procedure" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "code" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "specialty" TEXT NOT NULL,
            "fastingTime" TEXT NOT NULL,
            "estimatedDuration" TEXT NOT NULL,
            "anesthesiaType" TEXT NOT NULL,
            "equipment" TEXT NOT NULL,
            "materials" TEXT NOT NULL,
            "bloodRequirement" TEXT NOT NULL,
            "teamSize" TEXT NOT NULL,
            "recoveryTimePACU" TEXT NOT NULL,
            "recoveryTimeICU" TEXT NOT NULL,
            "hospitalizationTime" TEXT NOT NULL,
            "homeRecoveryTime" TEXT NOT NULL,
            "suggestedCertificateTime" TEXT NOT NULL,
            "consentForm" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "Procedure_code_key" ON "Procedure"("code");

        CREATE TABLE IF NOT EXISTS "ProcedureReport" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "user" TEXT NOT NULL,
            "avatar" TEXT,
            "content" TEXT NOT NULL,
            "date" TEXT NOT NULL,
            "procedureId" TEXT NOT NULL,
            CONSTRAINT "ProcedureReport_procedureId_fkey"
                FOREIGN KEY ("procedureId") REFERENCES "Procedure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
        );

        CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'user',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `)
}

function createPrismaClient() {
    // Determina o banco com base nas variáveis de ambiente (DB_TARGET e DATABASE_URL)
    const isPostgres =
        process.env.DB_TARGET === 'postgres' ||
        (process.env.DATABASE_URL &&
            (process.env.DATABASE_URL.startsWith('postgres://') ||
                process.env.DATABASE_URL.startsWith('postgresql://')));


    if (isPostgres) {
        console.log('Initializing Prisma Client with PostgreSQL')
        const pool = new Pool({ connectionString: process.env.DATABASE_URL })
        const adapter = new PrismaPg(pool)
        return new PrismaClient({ adapter })
    }

    console.log('Initializing Prisma Client with SQLite')
    
    // Se estiver em desenvolvimento, utiliza a URL definida em SQLITE_URL
    let dbPath = DB_PATH
    if (process.env.SQLITE_URL) {
        // Remove o prefixo 'file:' se existir
        dbPath = process.env.SQLITE_URL.replace(/^file:/, '')
    }

    // Inicializa o banco e aplica o schema via better-sqlite3 diretamente
    const db = new Database(dbPath)
    initSchema(db)
    db.close()

    // O adapter faz sua própria conexão usando o mesmo arquivo
    const adapter = new PrismaBetterSqlite3({ url: dbPath })
    return new PrismaClient({ adapter })
}

const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma
}

export default prisma
