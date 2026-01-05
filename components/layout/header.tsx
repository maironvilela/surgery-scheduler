"use client";

import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();

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
            </div>
        </header>
    );
}
