"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    Stethoscope,
    DoorOpen,
    Building2,
    Activity,
    MessageCircle,
    UserCog,
} from "lucide-react";

const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/agenda", label: "Agenda", icon: CalendarDays },
    { href: "/consultas", label: "Consultas", icon: MessageCircle },
    { href: "/pacientes", label: "Pacientes", icon: Users },
    { href: "/medicos", label: "Médicos", icon: Stethoscope },
    { href: "/hospitais", label: "Hospitais", icon: Building2 },
    { href: "/procedimentos", label: "Procedimentos", icon: Activity },
    { href: "/usuarios", label: "Usuários", icon: UserCog },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();

    return (
        <aside
            className={cn(
                "flex h-full w-64 flex-col border-r bg-white",
                className
            )}
        >
            <div className="flex h-16 items-center justify-center border-b p-4">
                <div className="relative">
                    <Image
                        src="/logo.png"
                        alt="Daya Gestão Médica"
                        className="object-contain"
                        width={80}
                        height={60}
                        priority
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto py-4">
                <nav className="space-y-1 px-3">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn("mr-3 h-5 w-5", isActive ? "text-primary" : "text-slate-400")}
                                />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="border-t p-4">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center border text-slate-500">
                        {/* Avatar Placeholder */}
                        <span>DR</span>
                    </div>
                    <div className="text-sm">
                        <p className="font-medium text-slate-900">Dr. Silva</p>
                        <p className="text-xs text-slate-500">Anestesiologista</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
