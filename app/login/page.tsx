"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";

function LoginContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const callbackUrl = searchParams.get("callbackUrl") ?? "/";
    const urlError = searchParams.get("error");

    // Exibe erro de URL (ex: sessão expirada)
    useEffect(() => {
        if (urlError) {
            setError("Sessão expirada ou acesso negado. Faça login novamente.");
        }
    }, [urlError]);

    // Se já autenticado, redireciona para a aplicação
    useEffect(() => {
        if (status === "authenticated" && session?.user) {
            router.replace(callbackUrl);
        }
    }, [status, session, router, callbackUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                email: email.trim(),
                password,
                redirect: false,
            });

            if (result?.error) {
                // Mensagem genérica — sem revelar se é e-mail ou senha (evita enumeração)
                setError("E-mail ou senha incorretos.");
            } else if (result?.ok) {
                router.replace(callbackUrl);
            }
        } catch {
            setError("Ocorreu um erro inesperado. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading" || status === "authenticated") {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm text-slate-400">Carregando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Orbs decorativos de fundo */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-400/10 blur-2xl" />

            <main className="relative z-10 w-full max-w-md px-6">
                {/* Card glassmorphism */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

                    {/* Logo / Ícone */}
                    <div className="mb-8 flex flex-col items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                            <svg viewBox="0 0 24 24" className="h-9 w-9 text-white" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-white">Surgery Scheduler</h1>
                            <p className="mt-1 text-sm text-slate-400">Sistema de Agendamento Cirúrgico</p>
                        </div>
                    </div>

                    {/* Mensagem de erro */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center" role="alert">
                            <p className="text-sm font-medium text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                        {/* Campo E-mail */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                E-mail
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
                                disabled={isLoading}
                            />
                        </div>

                        {/* Campo Senha */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Senha
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-slate-500 outline-none transition-all duration-200 focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30 disabled:opacity-50"
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Botão de login */}
                        <button
                            id="btn-login"
                            type="submit"
                            disabled={isLoading || !email || !password}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
                                    <span>Entrando...</span>
                                </>
                            ) : (
                                <span>Entrar</span>
                            )}
                        </button>
                    </form>

                    {/* Rodapé informativo */}
                    <p className="mt-6 text-center text-xs text-slate-500">
                        Acesso restrito a usuários autorizados.
                        <br />
                        Fale com o administrador para obter acesso.
                    </p>
                </div>

                <p className="mt-4 text-center text-xs text-slate-600">
                    © {new Date().getFullYear()} Surgery Scheduler · Acesso Seguro
                </p>
            </main>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}
