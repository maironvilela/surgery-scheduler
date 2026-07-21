import type { NextAuthConfig } from "next-auth";

/**
 * Configuração do NextAuth compatível com Edge Runtime (Middleware).
 * NÃO deve importar Prisma, bcrypt ou drivers Node.js (pg, sqlite).
 */
export const authConfig = {
    trustHost: true,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "daya-surgery-scheduler-secret-key-2026",
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

            const userRole = (auth?.user as any)?.role;
            const mustChange = (auth?.user as any)?.mustChangePassword;
            const isChangePasswordPage = nextUrl.pathname.startsWith("/alterar-senha");
            const isUsuariosPage = nextUrl.pathname.startsWith("/usuarios");

            // Se o usuário precisa alterar a senha no primeiro acesso e tenta navegar fora de /alterar-senha
            if (mustChange && !isChangePasswordPage) {
                return Response.redirect(new URL("/alterar-senha", nextUrl));
            }

            // Se o usuário já alterou a senha e tenta acessar /alterar-senha manualmente
            if (!mustChange && isChangePasswordPage) {
                return Response.redirect(new URL("/", nextUrl));
            }

            // Restrição de Acesso: Apenas administradores podem acessar a rota /usuarios
            if (isUsuariosPage && userRole !== "admin") {
                return Response.redirect(new URL("/", nextUrl));
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
            if (session.user) {
                (session.user as typeof session.user & { mustChangePassword?: boolean }).mustChangePassword =
                    token.mustChangePassword as boolean;
            }
            return session;
        },
        jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.mustChangePassword = (user as any).mustChangePassword;
            }
            // Atualiza a flag na sessão após o usuário alterar a senha
            if (trigger === "update" && session?.mustChangePassword !== undefined) {
                token.mustChangePassword = session.mustChangePassword;
            }
            return token;
        },
    },
    providers: [], // Preenchido no auth.ts (ambiente Node.js)
} satisfies NextAuthConfig;
