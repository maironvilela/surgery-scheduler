import { cn } from "@/lib/utils";

export type StatusType = "Agendado" | "Em Andamento" | "Finalizado" | "Cancelado";

interface StatusBadgeProps {
    status: StatusType | string;
    className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const styles: Record<string, string> = {
        "Agendado": "bg-blue-50 text-blue-700 border-blue-100",
        "Em aAndamento": "bg-amber-50 text-amber-700 border-amber-100", // Fixed typo in key from thought process if any
        "Em Andamento": "bg-amber-50 text-amber-700 border-amber-100",
        "Finalizado": "bg-emerald-50 text-emerald-700 border-emerald-100",
        "Cancelado": "bg-red-50 text-red-700 border-red-100",
    };

    const defaultStyle = "bg-slate-50 text-slate-700 border-slate-100";

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                styles[status as string] || defaultStyle,
                className
            )}
        >
            {status}
        </span>
    );
}
