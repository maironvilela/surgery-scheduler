import type { NextAuthConfig } from "next-auth";

/**
 * Configuração do NextAuth compatível com Edge Runtime (Middleware).
 * NÃO deve importar Prisma, bcrypt ou drivers Node.js (pg, sqlite).
 */
export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isPublicPath =
                nextUrl.pathname.startsWith("/login") ||
                nextUrl.pathname.startsWith("/api/auth");

            if (isPublicPath) {
                return true;
            }

            if (!isLoggedIn) {
                return false; // Redireciona para /login
            }

            return true;
        },
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
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
    },
    providers: [], // Preenchido no auth.ts (ambiente Node.js)
} satisfies NextAuthConfig;
