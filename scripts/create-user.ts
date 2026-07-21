/**
 * Script para criar ou atualizar usuários no sistema.
 *
 * Uso:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/create-user.ts \
 *     --email=admin@gmail.com \
 *     --password=MinhaSenh@123 \
 *     --name="Mairón Vilela"
 *
 * Opções:
 *   --email     E-mail do usuário (obrigatório)
 *   --password  Senha do usuário (obrigatório, mín. 8 caracteres)
 *   --name      Nome do usuário (obrigatório)
 *   --role      Papel: "admin" ou "user" (padrão: "user")
 */

import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import Database from "better-sqlite3";
import { Pool } from "pg";

// ─── Leitura dos argumentos CLI ──────────────────────────────────────────────

function getArg(name: string): string | undefined {
    const prefix = `--${name}=`;
    const arg = process.argv.find((a) => a.startsWith(prefix));
    return arg ? arg.slice(prefix.length) : undefined;
}

const email = getArg("email");
const password = getArg("password");
const name = getArg("name");
const role = getArg("role") ?? "user";

// ─── Validações ───────────────────────────────────────────────────────────────

if (!email || !password || !name) {
    console.error("\n❌ Uso: npx ts-node scripts/create-user.ts --email=... --password=... --name=...\n");
    process.exit(1);
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    console.error("\n❌ E-mail inválido.\n");
    process.exit(1);
}

if (password.length < 8) {
    console.error("\n❌ A senha deve ter pelo menos 8 caracteres.\n");
    process.exit(1);
}

if (!["admin", "user"].includes(role)) {
    console.error("\n❌ Role inválido. Use 'admin' ou 'user'.\n");
    process.exit(1);
}

// ─── Conexão com o banco ──────────────────────────────────────────────────────

function createClient(): PrismaClient {
    const isPostgres =
        process.env.DB_TARGET === "postgres" ||
        (process.env.DATABASE_URL &&
            (process.env.DATABASE_URL.startsWith("postgres://") ||
                process.env.DATABASE_URL.startsWith("postgresql://")));

    if (isPostgres) {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL });
        const adapter = new PrismaPg(pool);
        return new PrismaClient({ adapter });
    }

    let dbPath = "/tmp/surgery-scheduler.db";
    if (process.env.SQLITE_URL) {
        dbPath = process.env.SQLITE_URL.replace(/^file:/, "");
    }

    // Garante que a tabela User existe no SQLite
    const db = new Database(dbPath);
    db.exec(`
        CREATE TABLE IF NOT EXISTS "User" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "email" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "passwordHash" TEXT NOT NULL,
            "role" TEXT NOT NULL DEFAULT 'user',
            "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
    `);
    db.close();

    const adapter = new PrismaBetterSqlite3({ url: dbPath });
    return new PrismaClient({ adapter });
}

// ─── Execução principal ───────────────────────────────────────────────────────

async function main() {
    const prisma = createClient();

    try {
        // Hash da senha com cost factor 12 (seguro e rápido o suficiente)
        const passwordHash = await bcrypt.hash(password!, 12);

        const existing = await prisma.user.findUnique({
            where: { email: email!.toLowerCase().trim() },
        });

        if (existing) {
            // Atualiza senha e nome se o usuário já existir
            await prisma.user.update({
                where: { email: email!.toLowerCase().trim() },
                data: { passwordHash, name: name!, role },
            });
            console.log(`\n✅ Usuário atualizado com sucesso!`);
            console.log(`   E-mail : ${email}`);
            console.log(`   Nome   : ${name}`);
            console.log(`   Role   : ${role}\n`);
        } else {
            // Cria novo usuário
            const { v4: uuidv4 } = await import("crypto").then((m) => ({
                v4: () => m.randomUUID(),
            }));
            await prisma.user.create({
                data: {
                    id: uuidv4(),
                    email: email!.toLowerCase().trim(),
                    name: name!,
                    passwordHash,
                    role,
                },
            });
            console.log(`\n✅ Usuário criado com sucesso!`);
            console.log(`   E-mail : ${email}`);
            console.log(`   Nome   : ${name}`);
            console.log(`   Role   : ${role}\n`);
        }
    } catch (error) {
        console.error("\n❌ Erro ao criar/atualizar usuário:", (error as Error).message, "\n");
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
