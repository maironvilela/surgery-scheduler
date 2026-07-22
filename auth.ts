import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";
import prisma from "@/lib/prisma";
import { sendAuthFailureAlert, sendAuthSuccessAlert } from "@/lib/whatsapp-alert";

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
                            mustChangePassword: true,
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
                        // Dispara alerta no WhatsApp de segurança (sem bloquear resposta de login)
                        sendAuthFailureAlert(credentials.email).catch((err) =>
                            console.error("[Auth] Falha ao enviar alerta de segurança:", err)
                        );
                        return null;
                    }

                    // Dispara notificação no WhatsApp de login bem-sucedido
                    sendAuthSuccessAlert(user.email, user.name).catch((err) =>
                        console.error("[Auth] Falha ao enviar notificação de sucesso:", err)
                    );

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        mustChangePassword: user.mustChangePassword,
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
