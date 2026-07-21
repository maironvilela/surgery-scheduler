import { handlers } from "@/auth";

/**
 * Handler de rotas para NextAuth v5.
 * Processa todos os callbacks do OAuth do Google em /api/auth/*.
 * (ex: /api/auth/signin, /api/auth/callback/google, /api/auth/signout)
 */
export const { GET, POST } = handlers;
