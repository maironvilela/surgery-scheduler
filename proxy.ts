import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Rotas públicas — acessíveis sem autenticação.
 * Todas as demais rotas são protegidas automaticamente.
 */
const PUBLIC_PATHS = ["/login", "/api/auth"];

function isPublicPath(pathname: string): boolean {
    return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export default auth(async function middleware(req: NextRequest & { auth: unknown }) {
    const { nextUrl, auth: session } = req as NextRequest & { auth: { user?: { email?: string } } | null };

    // Rota pública → deixa passar
    if (isPublicPath(nextUrl.pathname)) {
        return NextResponse.next();
    }

    // Não autenticado → redireciona para /login
    if (!session?.user) {
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
});

export const config = {
    /**
     * Aplica o middleware em todas as rotas exceto:
     * - arquivos estáticos (_next/static, _next/image, favicon)
     * - ícones e imagens públicas
     */
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
