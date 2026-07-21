import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "E-mail", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            /**
             * Valida as credenciais do usuário (Node.js Server Runtime).
             * Retorna null em QUALQUER falha (e-mail ou senha) — sem revelar qual campo está incorreto.
             */
            async authorize(credentials) {
                if (
                    !credentials?.email ||
                    !credentials?.password ||
                    typeof credentials.email !== "string" ||
                    typeof credentials.password !== "string"
                ) {
                    return null;
                }

                try {
                    // Busca o usuário pelo e-mail (Node.js Server context)
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email.toLowerCase().trim() },
                        select: {
                            id: true,
                            email: true,
                            name: true,
                            passwordHash: true,
                            role: true,
                        },
                    });

                    // Resposta em tempo constante para evitar timing attacks
                    const dummyHash =
                        "$2b$12$invalidhashfortimingprotectiononlyxxxxxxxxxxxxxxxxxxxxxxx";
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user?.passwordHash ?? dummyHash
                    );

                    if (!user || !isValid) {
                        console.warn("[Auth] Tentativa de login com credenciais inválidas.");
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                    };
                } catch (error) {
                    console.error("[Auth] Erro ao verificar credenciais:", (error as Error).message);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60,
    },
    secret: process.env.NEXTAUTH_SECRET,
});
