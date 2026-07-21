"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Key, Lock, CheckCircle2 } from "lucide-react";
import { changeOwnPassword } from "@/app/actions/users";

export default function AlterarSenhaPage() {
    const { data: session, update } = useSession();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!newPassword || !confirmPassword) {
            setError("Preencha todos os campos da nova senha.");
            return;
        }

        if (newPassword.length < 8) {
            setError("A nova senha deve possuir pelo menos 8 caracteres.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("A nova senha e a confirmação não conferem.");
            return;
        }

        if (!session?.user?.id) {
            setError("Sessão inválida. Faça login novamente.");
            return;
        }

        setIsLoading(true);
        try {
            await changeOwnPassword({
                userId: session.user.id,
                currentPassword: currentPassword.trim() || undefined,
                newPassword: newPassword.trim(),
            });

            // Atualiza o token da sessão do NextAuth para mustChangePassword = false
            await update({ mustChangePassword: false });

            setSuccessMessage("Senha alterada com sucesso! Redirecionando...");

            setTimeout(() => {
                router.replace("/");
                router.refresh();
            }, 1200);
        } catch (err: any) {
            setError(err.message || "Erro ao alterar a senha.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
            {/* Orbs decorativos */}
            <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />

            <main className="relative z-10 w-full max-w-md px-6">
                {/* Card Glassmorphism */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">

                    {/* Cabeçalho do Card */}
                    <div className="mb-6 flex flex-col items-center gap-3 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                            <ShieldCheck className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">Alteração de Senha</h1>
                            <p className="mt-1 text-xs text-slate-400">
                                Por medida de segurança, cadastre sua nova senha de acesso.
                            </p>
                        </div>
                    </div>

                    {/* Alerta de erro */}
                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-center" role="alert">
                            <p className="text-xs font-medium text-red-400">{error}</p>
                        </div>
                    )}

                    {/* Alerta de sucesso */}
                    {successMessage && (
                        <div className="mb-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            <p className="text-xs font-medium text-emerald-400">{successMessage}</p>
                        </div>
                    )}

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Senha Atual */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="current-password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Senha Atual (Temporária)
                            </label>
                            <div className="relative">
                                <Key className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    id="current-password"
                                    type={showPassword ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Senha utilizada para entrar"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>

                        {/* Nova Senha */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="new-password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Nova Senha *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    id="new-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Mínimo 8 caracteres"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Nova Senha */}
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="confirm-password" className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                Confirmar Nova Senha *
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                                <input
                                    id="confirm-password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Digite novamente a nova senha"
                                    className="w-full rounded-xl border border-white/10 bg-white/5 pl-9 pr-10 py-2.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-1 focus:ring-blue-500/30"
                                />
                            </div>
                        </div>

                        {/* Dica de Segurança */}
                        <p className="text-[11px] text-slate-500">
                            A senha deve possuir no mínimo 8 caracteres.
                        </p>

                        {/* Botão de Salvar */}
                        <button
                            type="submit"
                            disabled={isLoading || !newPassword || !confirmPassword}
                            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:from-blue-500 hover:to-indigo-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Salvando...</span>
                                </>
                            ) : (
                                <span>Salvar Nova Senha</span>
                            )}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}
