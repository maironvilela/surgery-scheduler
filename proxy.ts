import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

/**
 * Middleware de proteção de rotas (Edge Runtime).
 * Usa authConfig que é leve e 100% compatível com Edge.
 */
export default NextAuth(authConfig).auth;

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
