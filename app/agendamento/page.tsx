"use client";

import { useState, useEffect, useMemo } from "react";
import { AppointmentForm } from "@/components/agendamento/appointment-form";
import { getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments";
import { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Copy, Trash2, Calendar, Search, RefreshCw, UserCheck, XCircle, FileText, Plus } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppDeepLink } from "@/lib/scheduling-utils";
import { formatPhone, toTitleCase } from "@/lib/utils";
import { useSession } from "next-auth/react";

function formatCreatedDate(isoStr?: string) {
    if (!isoStr) return "-";
    try {
        const d = new Date(isoStr);
        if (isNaN(d.getTime())) return "-";
        const dateStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const timeStr = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        return `${dateStr} ${timeStr}`;
    } catch {
        return "-";
    }
}

export default function AgendamentoPage() {
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === "admin";
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<string>("agendamento");

    // Filters
    const [searchName, setSearchName] = useState("");
    const [filterDate, setFilterDate] = useState<string>("");

    const loadAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await getAppointments();
            setAppointments(data);
        } catch (error) {
            console.error("Erro ao carregar agendamentos:", error);
            toast.error("Erro ao carregar lista de agendamentos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleAppointmentCreated = (newApp: Appointment) => {
        setAppointments((prev) => [newApp, ...prev]);
        setActiveTab("todos");
    };

    const handleCopyMessage = async (app: Appointment) => {
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(app.whatsappMessage);
                toast.success("Mensagem copiada para a área de transferência!");
            }
        } catch (error) {
            toast.error("Erro ao copiar mensagem.");
        }
    };

    const handleSendUTalk = async (app: Appointment) => {
        let toPhone = app.patientPhone.replace(/\D/g, "");
        if (toPhone.length === 10 || toPhone.length === 11) {
            toPhone = "+55" + toPhone;
        } else if (toPhone.startsWith("55") && toPhone.length >= 12) {
            toPhone = "+" + toPhone;
        } else if (!toPhone.startsWith("+")) {
            toPhone = "+" + toPhone;
        }

        try {
            const res = await fetch("/api/utalk/send", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    toPhone,
                    message: app.whatsappMessage,
                    contactName: app.patientName,
                    doctorName: app.doctorName,
                }),
            });

            if (res.ok) {
                toast.success(`Mensagem reenviada via uTalk para ${app.patientName}!`);
                await updateAppointmentStatus(app.id, app.status, true);
                setAppointments((prev) => prev.map((a) => (a.id === app.id ? { ...a, whatsappSent: true } : a)));
            } else {
                const errData = await res.json().catch(() => ({}));
                toast.error(`Erro ao enviar uTalk: ${errData.error || "Falha na API"}`);
            }
        } catch (error) {
            console.error("Erro uTalk:", error);
            toast.error("Erro ao conectar com API uTalk.");
        }
    };

    const handleToggleCancel = async (app: Appointment) => {
        const isCancelled = app.status?.toUpperCase() === "CANCELADO";
        const newStatus = isCancelled ? "AGENDADO" : "CANCELADO";
        try {
            await updateAppointmentStatus(app.id, newStatus);
            setAppointments((prev) =>
                prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a))
            );
            if (newStatus === "CANCELADO") {
                toast.success(`Agendamento de ${app.patientName} cancelado.`);
            } else {
                toast.success(`Agendamento de ${app.patientName} reativado.`);
            }
        } catch (error) {
            console.error("Erro ao alterar status do agendamento:", error);
            toast.error("Erro ao alterar status do agendamento.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este agendamento?")) return;

        try {
            await deleteAppointment(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Agendamento excluído com sucesso!");
        } catch (error) {
            toast.error("Erro ao excluir agendamento.");
        }
    };

    // Filter appointments by search query and date
    const filteredAppointments = useMemo(() => {
        return appointments.filter((app) => {
            const matchesSearch =
                !searchName ||
                app.patientName.toLowerCase().includes(searchName.toLowerCase()) ||
                app.patientPhone.includes(searchName) ||
                (app.createdBy && app.createdBy.toLowerCase().includes(searchName.toLowerCase()));

            const matchesDate = !filterDate || app.appointmentDate === filterDate;
            return matchesSearch && matchesDate;
        });
    }, [appointments, searchName, filterDate]);

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Agendamento de Consultas
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Cadastre agendamentos, gere mensagens formatadas e acompanhe o histórico de agendamentos.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadAppointments} className="self-start md:self-auto gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar Lista
                </Button>
            </div>

            {/* Abas da Página Centralizadas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full flex flex-col items-center">
                <TabsList className="grid w-full max-w-[600px] grid-cols-2 rounded-xl p-1 bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-sm h-12">
                    <TabsTrigger
                        value="agendamento"
                        className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-md"
                    >
                        Agendamento
                    </TabsTrigger>
                    <TabsTrigger
                        value="todos"
                        className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-primary data-[state=active]:shadow-md"
                    >
                        Todos os Agendamentos
                    </TabsTrigger>
                </TabsList>

                {/* Aba 1: Formulário de Agendamento */}
                <TabsContent value="agendamento" className="space-y-6 w-full">
                    <AppointmentForm onAppointmentCreated={handleAppointmentCreated} />
                </TabsContent>

                {/* Aba 2: Lista de Todos os Agendamentos */}
                <TabsContent value="todos" className="space-y-6 w-full">
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        Agendamentos Cadastrados ({filteredAppointments.length})
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Histórico completo de agendamentos gravados no sistema.
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Filtros da Lista */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por paciente, tel, atendente..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="pl-8 text-xs h-9 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>

                                <Input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                    className="h-9 text-xs bg-slate-50 dark:bg-slate-800"
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="p-0">
                            {isLoading ? (
                                <div className="p-8 text-center text-sm text-slate-500">Carregando agendamentos...</div>
                            ) : filteredAppointments.length === 0 ? (
                                <div className="p-8 text-center text-sm text-slate-500">
                                    Nenhum agendamento encontrado.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                                                <TableHead className="text-xs">Paciente / Telefone</TableHead>
                                                <TableHead className="text-xs">Médico & Local</TableHead>
                                                <TableHead className="text-xs">Data da Consulta</TableHead>
                                                <TableHead className="text-xs">Realizado em</TableHead>
                                                <TableHead className="text-xs">Usuário Responsável</TableHead>
                                                <TableHead className="text-xs text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAppointments.map((app) => {
                                                const isCancelled = app.status?.toUpperCase() === "CANCELADO";
                                                return (
                                                    <TableRow
                                                        key={app.id}
                                                        className={`text-xs transition-colors ${
                                                            isCancelled
                                                                ? "bg-red-50/80 dark:bg-red-950/40 hover:bg-red-100/80 dark:hover:bg-red-950/60"
                                                                : "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                                        }`}
                                                    >
                                                        <TableCell className="font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <span className={isCancelled ? "line-through text-red-700 dark:text-red-300 font-semibold" : "font-semibold text-slate-900 dark:text-slate-100"}>
                                                                    {toTitleCase(app.patientName)}
                                                                </span>
                                                                {isCancelled && (
                                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 border-red-300 dark:border-red-800 font-semibold">
                                                                        CANCELADO
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5 flex-wrap">
                                                                <span>{formatPhone(app.patientPhone)}</span>
                                                                {app.appointmentType === "Particular" || app.insurance?.toLowerCase() === "particular" ? (
                                                                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                                                                        • Particular{app.amount ? ` (R$ ${app.amount.replace(/^R\$\s*/i, "")})` : ""}
                                                                    </span>
                                                                ) : (
                                                                    (app.insurance || app.plan) && (
                                                                        <span className="text-slate-400">• {[app.insurance, app.plan].filter(Boolean).join(" - ")}</span>
                                                                    )
                                                                )}
                                                                {app.fromWebsite && (
                                                                    <Badge variant="outline" className="text-[10px] px-1 py-0 bg-amber-50 text-amber-700 border-amber-200">
                                                                        Site
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="text-slate-800 dark:text-slate-200 font-medium">{app.doctorName}</div>
                                                            <div className="text-slate-500 text-[11px] truncate max-w-[140px]">{app.locationName}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                                                {app.appointmentDate.split("-").reverse().join("/")}
                                                            </div>
                                                            <div className="text-slate-500 text-[11px]">{app.appointmentTime}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium text-slate-800 dark:text-slate-200">
                                                                {formatCreatedDate(app.createdAt)}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                                <UserCheck className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                                                <span>{app.createdBy || (app.fromWebsite ? "Site" : "Usuário do Sistema")}</span>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="text-right">
                                                            <div className="flex items-center justify-end gap-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                    title="Enviar via uTalk (WhatsApp)"
                                                                    onClick={() => handleSendUTalk(app)}
                                                                >
                                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-7 w-7 text-slate-600 hover:text-blue-600"
                                                                    title="Copiar Mensagem"
                                                                    onClick={() => handleCopyMessage(app)}
                                                                >
                                                                    <Copy className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className={`h-7 w-7 ${
                                                                        isCancelled
                                                                            ? "text-slate-400 hover:text-green-600 hover:bg-green-50"
                                                                            : "text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                    }`}
                                                                    title={isCancelled ? "Reativar Agendamento" : "Cancelar Agendamento"}
                                                                    onClick={() => handleToggleCancel(app)}
                                                                >
                                                                    <XCircle className="h-3.5 w-3.5" />
                                                                </Button>
                                                                {isAdmin && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-7 w-7 text-slate-400 hover:text-red-600"
                                                                        title="Excluir (Apenas Administrador)"
                                                                        onClick={() => handleDelete(app.id)}
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

