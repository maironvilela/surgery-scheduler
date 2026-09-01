"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, UserCheck, Users, Building2, Stethoscope, Filter, RefreshCw, BarChart3, TrendingUp, Globe, Smartphone } from "lucide-react";
import { getAppointments } from "@/app/actions/appointments";
import { Appointment } from "@/types";
import { DOCTORS_MAPPING, LOCATIONS_MAPPING } from "@/lib/constants/scheduling";
import { motion } from "framer-motion";

const MONTH_NAMES = [
    { value: "01", label: "Janeiro" },
    { value: "02", label: "Fevereiro" },
    { value: "03", label: "Março" },
    { value: "04", label: "Abril" },
    { value: "05", label: "Maio" },
    { value: "06", label: "Junho" },
    { value: "07", label: "Julho" },
    { value: "08", label: "Agosto" },
    { value: "09", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" },
];

export function AppointmentMetrics() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters State
    const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
    const [selectedLocation, setSelectedLocation] = useState<string>("all");
    const [selectedMonth, setSelectedMonth] = useState<string>("all"); // "01".."12" or "all"

    const loadData = async () => {
        setIsLoading(true);
        try {
            const data = await getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Doctor Options (Static + DB appointments)
    const doctorOptions = useMemo(() => {
        const set = new Set<string>();
        DOCTORS_MAPPING.forEach((d) => set.add(d.name));
        appointments.forEach((a) => set.add(a.doctorName));
        return Array.from(set);
    }, [appointments]);

    // Location Options (Static + DB appointments)
    const locationOptions = useMemo(() => {
        const set = new Set<string>();
        LOCATIONS_MAPPING.forEach((l) => set.add(l.name));
        appointments.forEach((a) => set.add(a.locationName));
        return Array.from(set);
    }, [appointments]);

    // Filtered Appointments
    const filteredAppointments = useMemo(() => {
        return appointments.filter((app) => {
            // Doctor filter
            if (selectedDoctor !== "all" && app.doctorName !== selectedDoctor) {
                return false;
            }
            // Location filter
            if (selectedLocation !== "all" && app.locationName !== selectedLocation) {
                return false;
            }
            // Month filter (based on YYYY-MM-DD in appointmentDate)
            if (selectedMonth !== "all") {
                const monthPart = app.appointmentDate.split("-")[1];
                if (monthPart !== selectedMonth) {
                    return false;
                }
            }
            return true;
        });
    }, [appointments, selectedDoctor, selectedLocation, selectedMonth]);

    // Metrics Calculations
    const totalAppointments = filteredAppointments.length;
    const attendantAppointments = useMemo(
        () => filteredAppointments.filter((a) => !a.fromWebsite).length,
        [filteredAppointments]
    );
    const websiteAppointments = useMemo(
        () => filteredAppointments.filter((a) => a.fromWebsite).length,
        [filteredAppointments]
    );
    const attendantPercentage = totalAppointments > 0
        ? Math.round((attendantAppointments / totalAppointments) * 100)
        : 0;

    // Monthly Chart Data breakdown (January - December)
    const monthlyChartData = useMemo(() => {
        return MONTH_NAMES.map((m) => {
            const monthApps = filteredAppointments.filter(
                (a) => a.appointmentDate.split("-")[1] === m.value
            );
            const total = monthApps.length;
            const attendants = monthApps.filter((a) => !a.fromWebsite).length;
            const website = monthApps.filter((a) => a.fromWebsite).length;
            return {
                month: m.label,
                monthShort: m.label.substring(0, 3),
                total,
                attendants,
                website,
            };
        });
    }, [filteredAppointments]);

    // Max value for chart scaling
    const maxChartValue = useMemo(() => {
        const max = Math.max(...monthlyChartData.map((d) => d.total), 1);
        return Math.ceil(max * 1.2);
    }, [monthlyChartData]);

    const resetFilters = () => {
        setSelectedDoctor("all");
        setSelectedLocation("all");
        setSelectedMonth("all");
    };

    return (
        <div className="space-y-6">
            {/* Header & Filter Card */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                Métricas de Agendamentos de Consultas
                            </CardTitle>
                            <CardDescription className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                                Acompanhe o volume total de consultas agendadas e a taxa realizada por nossos atendentes.
                            </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                            {(selectedDoctor !== "all" || selectedLocation !== "all" || selectedMonth !== "all") && (
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs text-slate-500">
                                    Limpar Filtros
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={loadData} className="gap-2 text-xs">
                                <RefreshCw className="h-3.5 w-3.5" />
                                Atualizar
                            </Button>
                        </div>
                    </div>

                    {/* Filtros em Linha */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t mt-4 border-slate-100 dark:border-slate-800">
                        {/* Filtro: Nome do Médico */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Stethoscope className="h-3.5 w-3.5 text-blue-500" />
                                Nome do Médico
                            </label>
                            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                                <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800">
                                    <SelectValue placeholder="Todos os médicos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Médicos</SelectItem>
                                    {doctorOptions.map((doc) => (
                                        <SelectItem key={doc} value={doc}>
                                            {doc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filtro: Local de Atendimento */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5 text-blue-500" />
                                Local de Atendimento
                            </label>
                            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800">
                                    <SelectValue placeholder="Todos os locais" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Locais</SelectItem>
                                    {locationOptions.map((loc) => (
                                        <SelectItem key={loc} value={loc}>
                                            {loc}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Filtro: Mês Desejado */}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                                Mês Desejado
                            </label>
                            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800">
                                    <SelectValue placeholder="Todos os meses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Meses</SelectItem>
                                    {MONTH_NAMES.map((m) => (
                                        <SelectItem key={m.value} value={m.value}>
                                            {m.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* KPI Cards: Quantidade de Agendamentos */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Total de Agendamentos */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Agendamentos Totais
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {isLoading ? "..." : totalAppointments}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                            <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                            Total de registros com os filtros selecionados
                        </p>
                    </CardContent>
                </Card>

                {/* Agendamentos via Site */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                            Agendamentos via Site
                        </CardTitle>
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                            <Globe className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                            {isLoading ? "..." : websiteAppointments}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                            <span>Origem direta das landing pages do site</span>
                            <span className="font-semibold text-amber-600 dark:text-amber-400">
                                {totalAppointments > 0 ? Math.round((websiteAppointments / totalAppointments) * 100) : 0}% do total
                            </span>
                        </p>
                    </CardContent>
                </Card>
            </div>


            {/* Gráfico Comparativo: Total vs Vindos do Site */}
            <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-blue-600" />
                                Comparativo: Quantidade de Agendamentos vs Vindos do Site
                            </CardTitle>
                            <CardDescription className="text-xs text-slate-500">
                                Distribuição mensal comparando o total de agendamentos e os vindos do site.
                            </CardDescription>
                        </div>
                        {/* Legenda do Gráfico - Somente 2 Opções */}
                        <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-blue-600"></div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Quantidade de Agendamento</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-3 h-3 rounded bg-amber-500"></div>
                                <span className="font-semibold text-slate-700 dark:text-slate-300">Vindo do Site</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="pt-2">
                    {/* Visual Bar Chart (Monthly Breakdown) */}
                    <div className="space-y-4">
                        {/* Container das Barras por Mês */}
                        <div className="h-64 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100 dark:border-slate-800">
                            {monthlyChartData.map((d, index) => {
                                const totalHeightPct = Math.max((d.total / maxChartValue) * 100, d.total > 0 ? 8 : 2);
                                const websiteHeightPct = Math.max((d.website / maxChartValue) * 100, d.website > 0 ? 8 : 2);

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                                        {/* Hover Tooltip */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 pointer-events-none bg-slate-900 text-white text-[11px] py-1 px-2.5 rounded-lg shadow-xl whitespace-nowrap">
                                            <div className="font-semibold">{d.month}</div>
                                            <div>Total: <span className="text-blue-300 font-bold">{d.total}</span> | Vindo do Site: <span className="text-amber-300 font-bold">{d.website}</span></div>
                                        </div>

                                        {/* Pair of 2 bars: Quantidade de Agendamento (Blue) & Vindo do Site (Amber) */}
                                        <div className="w-full flex items-end justify-center gap-1 h-full">
                                            {/* Quantidade de Agendamento Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${totalHeightPct}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.03 }}
                                                className="w-1/2 max-w-[18px] bg-blue-600 dark:bg-blue-500 rounded-t-md transition-all group-hover:brightness-110"
                                            />
                                            {/* Vindo do Site Bar */}
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: `${websiteHeightPct}%` }}
                                                transition={{ duration: 0.5, delay: index * 0.03 + 0.1 }}
                                                className="w-1/2 max-w-[18px] bg-amber-500 dark:bg-amber-400 rounded-t-md transition-all group-hover:brightness-110"
                                            />
                                        </div>

                                        {/* Month Label */}
                                        <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate w-full text-center">
                                            {d.monthShort}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Totais Gerais de Comparação (Barra de Progresso Cumulativa) */}
                        <div className="pt-2 space-y-2">
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                                <span>Quantidade Total de Agendamento: {totalAppointments}</span>
                                <span className="text-amber-600 dark:text-amber-400">
                                    Vindo do Site: {websiteAppointments} ({totalAppointments > 0 ? Math.round((websiteAppointments / totalAppointments) * 100) : 0}%)
                                </span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                <div
                                    className="bg-blue-600 h-full transition-all duration-500"
                                    style={{ width: `${totalAppointments > 0 ? Math.round(((totalAppointments - websiteAppointments) / totalAppointments) * 100) : 100}%` }}
                                />
                                <div
                                    className="bg-amber-500 h-full transition-all duration-500"
                                    style={{ width: `${totalAppointments > 0 ? Math.round((websiteAppointments / totalAppointments) * 100) : 0}%` }}
                                />
                            </div>
                            <div className="flex items-center justify-between text-[11px] text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                                    <span>Quantidade de Agendamento ({totalAppointments})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                                    <span>Vindo do Site ({websiteAppointments})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

