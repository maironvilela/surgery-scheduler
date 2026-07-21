import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "E-mail", type: "email" },
                password: { label: "Senha", type: "password" },
            },
            /**
             * Valida as credenciais do usuário.
             * Executado no servidor. Retorna null em QUALQUER falha (e-mail ou senha) —
             * sem revelar qual campo está incorreto (evita enumeração de usuários).
             * NOTA DE SEGURANÇA: credenciais nunca são logadas.
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
                    // Busca o usuário pelo e-mail (query parametrizada via Prisma — sem SQL injection)
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

                    // Usuário não encontrado — retorna null com resposta em tempo constante
                    // para evitar timing attacks (sempre compara mesmo sem usuário)
                    const dummyHash =
                        "$2b$12$invalidhashfortimingprotectiononlyxxxxxxxxxxxxxxxxxxxxxxx";
                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user?.passwordHash ?? dummyHash
                    );

                    if (!user || !isValid) {
                        // Loga apenas status, nunca as credenciais
                        console.warn("[Auth] Tentativa de login com credenciais inválidas.");
                        return null;
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        // image não disponível no modo credentials (sem OAuth)
                    };
                } catch (error) {
                    // Erro de banco: falha segura (fail-close)
                    console.error("[Auth] Erro ao verificar credenciais:", (error as Error).message);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        /**
         * session callback — disponibiliza dados do usuário em componentes cliente.
         */
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            if (session.user && token.role) {
                (session.user as typeof session.user & { role: string }).role =
                    token.role as string;
            }
            return session;
        },

        /**
         * jwt callback — persiste dados no token JWT de sessão.
         */
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    session: {
        strategy: "jwt",
        // Sessão expira em 8 horas — sem sessões infinitas
        maxAge: 8 * 60 * 60,
    },
    /**
     * NEXTAUTH_SECRET DEVE ser definido em .env.
     * Em produção, a ausência deste valor causará erro intencional (fail-close).
     * TODO(security): Considerar rotação periódica do secret via KMS em produção.
     * TODO(security): Considerar MFA para fortalecer a autenticação.
     * TODO(security): Considerar detecção de senhas vazadas (HaveIBeenPwned API).
     */
    secret: process.env.NEXTAUTH_SECRET,
});
