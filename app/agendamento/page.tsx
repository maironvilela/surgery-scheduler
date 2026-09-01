"use client";

import { useState, useEffect, useMemo } from "react";
import { AppointmentForm } from "@/components/agendamento/appointment-form";
import { getAppointments, updateAppointmentStatus, deleteAppointment } from "@/app/actions/appointments";
import { Appointment } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessageSquare, Copy, ExternalLink, Trash2, Calendar, Search, Filter, CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { buildWhatsAppDeepLink } from "@/lib/scheduling-utils";
import { formatPhone } from "@/lib/utils";

export default function AgendamentoPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filters
    const [searchName, setSearchName] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [filterDate, setFilterDate] = useState<string>("");

    const loadAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await getAppointments();
            setAppointments(data);
        } catch (error) {
            toast.error("Erro ao carregar agendamentos.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAppointments();
    }, []);

    const handleAppointmentCreated = (newAppointment: Appointment) => {
        setAppointments((prev) => [newAppointment, ...prev]);
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

    const handleOpenWhatsApp = (app: Appointment) => {
        const link = buildWhatsAppDeepLink(app.patientPhone, app.whatsappMessage);
        window.open(link, "_blank", "noopener,noreferrer");
    };


    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const updated = await updateAppointmentStatus(id, newStatus);
            setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
            toast.success(`Status alterado para ${newStatus}`);
        } catch (error) {
            toast.error("Erro ao atualizar status.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Deseja realmente remover este agendamento?")) return;
        try {
            await deleteAppointment(id);
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            toast.success("Agendamento removido.");
        } catch (error) {
            toast.error("Erro ao excluir agendamento.");
        }
    };

    const filteredAppointments = useMemo(() => {
        return appointments.filter((app) => {
            const matchesName = !searchName || app.patientName.toLowerCase().includes(searchName.toLowerCase()) || app.patientPhone.includes(searchName);
            const matchesStatus = filterStatus === "all" || app.status === filterStatus;
            const matchesDate = !filterDate || app.appointmentDate === filterDate;
            return matchesName && matchesStatus && matchesDate;
        });
    }, [appointments, searchName, filterStatus, filterDate]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "AGENDADO":
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100">Agendado</Badge>;
            case "CANCELADO":
                return <Badge className="bg-red-100 text-red-800 border-red-200 hover:bg-red-100">Cancelado</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        Agendamento de Consultas
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Cadastre agendamentos, gere mensagens formatadas e envie via uTalk WhatsApp.
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={loadAppointments} className="self-start md:self-auto gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Atualizar Lista
                </Button>
            </div>

            {/* Layout em Grid / Colunas */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Form Card */}
                <div className="lg:col-span-5">
                    <AppointmentForm onAppointmentCreated={handleAppointmentCreated} />
                </div>

                {/* Recent Appointments List */}
                <div className="lg:col-span-7 space-y-4">
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                                        <Calendar className="h-5 w-5 text-blue-600" />
                                        Agendamentos Cadastrados ({filteredAppointments.length})
                                    </CardTitle>
                                    <CardDescription className="text-xs text-slate-500">
                                        Histórico de agendamentos no banco de dados.
                                    </CardDescription>
                                </div>
                            </div>

                            {/* Filtros */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Buscar por paciente/tel..."
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        className="pl-8 text-xs h-9 bg-slate-50 dark:bg-slate-800"
                                    />
                                </div>

                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="h-9 text-xs bg-slate-50 dark:bg-slate-800">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos os Status</SelectItem>
                                        <SelectItem value="AGENDADO">Agendado</SelectItem>
                                        <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                    </SelectContent>
                                </Select>

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
                                                <TableHead className="text-xs">Data / Horário</TableHead>
                                                <TableHead className="text-xs">Status</TableHead>
                                                <TableHead className="text-xs text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {filteredAppointments.map((app) => (
                                                <TableRow key={app.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 text-xs">
                                                    <TableCell className="font-medium">
                                                        <div className="font-semibold text-slate-900 dark:text-slate-100">{app.patientName}</div>
                                                        <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                                                            <span>{formatPhone(app.patientPhone)}</span>
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
                                                        <div className="flex items-center gap-1">
                                                            {getStatusBadge(app.status)}
                                                            <Select value={app.status} onValueChange={(val) => handleStatusChange(app.id, val)}>
                                                                <SelectTrigger className="h-6 text-[10px] w-6 p-0 border-0 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                    <SelectValue placeholder="" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="AGENDADO">Agendado</SelectItem>
                                                                    <SelectItem value="CANCELADO">Cancelado</SelectItem>
                                                                </SelectContent>
                                                            </Select>
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
                                                                className="h-7 w-7 text-slate-400 hover:text-red-600"
                                                                title="Excluir"
                                                                onClick={() => handleDelete(app.id)}
                                                            >
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>

                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
