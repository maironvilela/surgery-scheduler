"use client";

import { Bell, Menu, Search, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const { data: session } = useSession();

    const getPageTitle = (path: string) => {
        switch (path) {
            case "/": return "Dashboard";
            case "/agenda": return "Agenda de Cirurgias";
            case "/agenda/novo": return "Novo Agendamento";
            case "/pacientes": return "Pacientes";
            case "/medicos": return "Médicos";
            case "/hospitais": return "Hospitais";
            case "/configuracoes": return "Configurações";
            default: return "Dashboard";
        }
    };

    const handleLogout = async () => {
        // Limpa o estado de sessão e redireciona para /login
        await signOut({ callbackUrl: "/login" });
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={onMenuClick}>
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Menu</span>
                </Button>
                <h1 className="text-xl font-semibold text-slate-800">
                    {getPageTitle(pathname)}
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative hidden sm:block">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                        type="search"
                        placeholder="Buscar paciente, médico..."
                        className="h-10 w-64 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <Button variant="ghost" size="icon" className="text-slate-500">
                    <Bell className="h-5 w-5" />
                    <span className="sr-only">Notificações</span>
                </Button>

                {/* Área do usuário autenticado */}
                {session?.user && (
                    <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div className="relative h-8 w-8 overflow-hidden rounded-full ring-2 ring-slate-100">
                            {session.user.image ? (
                                <Image
                                    src={session.user.image}
                                    alt={session.user.name ?? "Usuário"}
                                    fill
                                    className="object-cover"
                                    sizes="32px"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-blue-600 text-xs font-semibold text-white">
                                    {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                                </div>
                            )}
                        </div>

                        {/* Nome do usuário (apenas desktop) */}
                        <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 lg:block">
                            {session.user.name}
                        </span>

                        {/* Botão de logout */}
                        <Button
                            id="btn-logout"
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-slate-500 hover:text-red-600"
                            title="Sair"
                            aria-label="Sair da conta"
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
        </header>
    );
}
