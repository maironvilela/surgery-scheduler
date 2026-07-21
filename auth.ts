import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Retorna a lista de e-mails autorizados a partir da variável de ambiente
 * ALLOWED_EMAILS (separados por vírgula). A validação ocorre exclusivamente
 * no servidor via callback signIn — nunca exposta ao cliente.
 */
function getAllowedEmails(): string[] {
    const raw = process.env.ALLOWED_EMAILS ?? "";
    return raw
        .split(",")
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    pages: {
        signIn: "/login",
        // Página de erro customizada (mostra mensagem de acesso negado)
        error: "/login",
    },
    callbacks: {
        /**
         * signIn callback — validação da whitelist de e-mails.
         * Executado no servidor. Retorna false bloqueia o login.
         * NOTA DE SEGURANÇA: o e-mail não é logado para evitar exposição de PII.
         */
        signIn({ user }) {
            const allowedEmails = getAllowedEmails();

            // Se a lista estiver vazia, bloqueia todos por segurança (fail-close)
            if (allowedEmails.length === 0) {
                console.warn(
                    "[Auth] ALLOWED_EMAILS está vazia — acesso bloqueado para todos os usuários."
                );
                return false;
            }

            const userEmail = user.email?.toLowerCase() ?? "";
            const isAllowed = allowedEmails.includes(userEmail);

            if (!isAllowed) {
                // Loga apenas status, nunca o e-mail em si (proteção de PII)
                console.warn("[Auth] Tentativa de login com e-mail não autorizado.");
                return "/login?error=AccessDenied";
            }

            return true;
        },

        /**
         * session callback — adiciona dados extras à sessão disponível no cliente.
         */
        session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub;
            }
            return session;
        },

        /**
         * jwt callback — persiste dados no token JWT da sessão.
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
        // Sessão expira em 8 horas (sem sessões infinitas)
        maxAge: 8 * 60 * 60,
    },
    /**
     * NEXTAUTH_SECRET DEVE ser definido em .env.
     * Em produção, a ausência deste valor causará erro intencional (fail-close).
     * TODO(security): Considerar rotação periódica do secret via KMS em produção.
     */
    secret: process.env.NEXTAUTH_SECRET,
});
