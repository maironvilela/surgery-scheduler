import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, AlertCircle, BedDouble, Clock } from "lucide-react";

export function KPICards() {
    const kpis = [
        {
            title: "Cirurgias Agendadas",
            value: "24",
            icon: Activity,
            description: "Próximos 7 dias",
            color: "text-blue-500",
        },
        {
            title: "Confirmadas",
            value: "18",
            icon: BedDouble,
            description: "75% do total",
            color: "text-emerald-500",
        },
        {
            title: "Aguardando Confirmação",
            value: "5",
            icon: Clock,
            description: "Ação necessária",
            color: "text-amber-500",
        },
        {
            title: "Canceladas pelo Paciente",
            value: "1",
            icon: AlertCircle,
            description: "Motivo: Financeiro",
            color: "text-red-500",
        },
    ];

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, index) => (
                <Card key={index}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600">
                            {kpi.title}
                        </CardTitle>
                        <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                        <p className="text-xs text-slate-500">{kpi.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
