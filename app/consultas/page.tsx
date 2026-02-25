"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, MessageCircle, Clock, Plus, Loader2, Upload, Pencil, User, Filter, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

import { useDoctors } from "@/context/doctor-context";
import { useHospitals } from "@/context/hospital-context";
import { usePatients } from "@/context/patient-context";
import { ConsultationItem } from "@/types";
import { formatPhone, toTitleCase } from "@/lib/utils";
import { toast } from "sonner";
import { getConsultations, addConsultation, updateConsultation, deleteConsultation, deleteAllConsultations } from "@/app/actions/consultations";

export default function ConsultasPage() {
    const { doctors } = useDoctors();
    const { hospitals } = useHospitals();
    const { patients: availablePatients, addPatient, updatePatient } = usePatients();

    // Form States
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [attendantName, setAttendantName] = useState<string>("");

    // List State
    const [patients, setPatients] = useState<ConsultationItem[]>([]);
    const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
    const [isLoadingConsultations, setIsLoadingConsultations] = useState(true);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
    const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);

    // Filter States
    const [filterDoctorId, setFilterDoctorId] = useState<string>("all");
    const [filterHospitalId, setFilterHospitalId] = useState<string>("all");
    const [filterDate, setFilterDate] = useState<string>("");

    // New Patient Input States
    const [newPatientName, setNewPatientName] = useState("");
    const [newPatientPhone, setNewPatientPhone] = useState("");
    const [newPatientTime, setNewPatientTime] = useState("");
    const [whatsappErrors, setWhatsappErrors] = useState<Record<string, boolean>>({});

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const updated = await updateConsultation(id, { status: newStatus });
            setPatients(patients.map(p => p.id === id ? updated as ConsultationItem : p));
            toast.success("Status atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    // Computed Values
    const selectedDoctor = useMemo(() =>
        doctors.find(d => d.id === selectedDoctorId),
        [doctors, selectedDoctorId]);

    const selectedHospital = useMemo(() =>
        hospitals.find(h => h.id === selectedHospitalId),
        [hospitals, selectedHospitalId]);

    const weekDay = useMemo(() => {
        if (!date) return "";
        // Create date object and adjust for timezone if necessary or just use string parsing
        // date input returns YYYY-MM-DD
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const dayName = format(dateObj, 'EEEE', { locale: ptBR });
        return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }, [date]);

    const formattedDate = useMemo(() => {
        if (!date) return "";
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return format(dateObj, "dd/MM/yyyy");
    }, [date]);

    // Derived state for suggestions
    const filteredPatients = useMemo(() => {
        if (!newPatientName) return [];
        const lowerTerm = newPatientName.toLowerCase();
        return availablePatients.filter(p =>
            p.name.toLowerCase().includes(lowerTerm)
        ).slice(0, 5);
    }, [newPatientName, availablePatients]);

    const filteredConsultations = useMemo(() => {
        return patients.filter(patient => {
            const matchesDoctor = filterDoctorId === "all" || patient.doctorId === filterDoctorId;
            const matchesHospital = filterHospitalId === "all" || patient.hospitalId === filterHospitalId;
            const matchesDate = !filterDate || (patient.date && patient.date.startsWith(filterDate));
            return matchesDoctor && matchesHospital && matchesDate;
        });
    }, [patients, filterDoctorId, filterHospitalId, filterDate]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    // WhatsApp Dialog State
    const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
    const [whatsAppMessage, setWhatsAppMessage] = useState("");
    const [patientToMessage, setPatientToMessage] = useState<ConsultationItem | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial Load
    useEffect(() => {
        async function load() {
            try {
                const data = await getConsultations(date);
                setPatients(data);
            } catch (error) {
                toast.error("Erro ao carregar consultas");
            } finally {
                setIsLoadingConsultations(false);
            }
        }
        load();
    }, [date]);

    // Actions
    const handleSelectPatient = (patient: any) => {
        setNewPatientName(patient.name);
        setNewPatientPhone(formatPhone(patient.phone || ""));
        setShowSuggestions(false);
    };

    const handleEditPatient = (patient: ConsultationItem) => {
        setEditingPatientId(patient.id);
        setNewPatientName(patient.patientName);
        setNewPatientPhone(patient.phone || "");
        setNewPatientTime(patient.time);
    };

    const handleCancelEdit = () => {
        setEditingPatientId(null);
        setNewPatientName("");
        setNewPatientPhone("");
        setNewPatientTime("");
    };

    const handleAddPatient = async () => {
        if (!newPatientName || !newPatientTime) return;

        const cleanPhone = newPatientPhone.replace(/\D/g, "");

        // Sync with global patient registry
        const existingPatient = availablePatients.find(
            p => p.name.toLowerCase() === newPatientName.toLowerCase()
        );

        if (existingPatient) {
            // Update phone if different
            if (existingPatient.phone !== cleanPhone) {
                await updatePatient(existingPatient.id, { ...existingPatient, phone: cleanPhone });
            }
        } else {
            // Create new patient
            await addPatient({
                name: newPatientName,
                phone: cleanPhone,
                insurance: "",
                plan: "",
                birthDate: "",
                gender: "other",
                cep: "",
                street: "",
                number: "",
                complement: "",
                neighborhood: "",
                city: "",
                state: "",
                email: "",
            });
        }

        if (editingPatientId) {
            try {
                const updated = await updateConsultation(editingPatientId, {
                    patientName: newPatientName,
                    phone: cleanPhone,
                    time: newPatientTime,
                    date: date || new Date().toISOString().split('T')[0]
                });
                setPatients(patients.map(p => p.id === editingPatientId ? updated as ConsultationItem : p));
                handleCancelEdit();
            } catch (error) {
                toast.error("Erro ao atualizar consulta");
            }
            return;
        }

        // Prevent Adding Duplicate Patient
        if (patients.some(p => p.patientName.toLowerCase() === newPatientName.toLowerCase())) {
            toast.warning("Este paciente já foi adicionado à lista.");
            return;
        }

        try {
            const newItem = await addConsultation({
                patientName: newPatientName,
                phone: cleanPhone,
                status: "Pendente",
                time: newPatientTime,
                date: date || new Date().toISOString().split('T')[0],
                whatsappSent: false,
                doctorId: selectedDoctorId,
                hospitalId: selectedHospitalId,
                insurance: availablePatients.find(p => p.name.toLowerCase() === newPatientName.toLowerCase())?.insurance || ""
            });

            setPatients([...patients, newItem as ConsultationItem]);
            setNewPatientName("");
            setNewPatientPhone("");
            setNewPatientTime("");
            toast.success("Paciente adicionado à lista");
        } catch (error) {
            toast.error("Erro ao adicionar consulta");
        }
    };

    const handleDeletePatient = async (id: string) => {
        try {
            await deleteConsultation(id);
            setPatients(patients.filter(p => p.id !== id));
            toast.success("Consulta removida");
        } catch (error) {
            toast.error("Erro ao remover consulta");
        }
    };

    const handleClearList = async () => {
        try {
            await deleteAllConsultations();
            setPatients([]);
            setIsClearDialogOpen(false);
            toast.success("Lista limpa com sucesso!");
        } catch (error) {
            toast.error("Erro ao limpar lista");
        }
    };

    const handleOpenWhatsAppDialog = (patient: ConsultationItem) => {
        if (!selectedDoctor || !selectedHospital || !date || !attendantName) {
            toast.warning("Por favor, preencha todos os campos do cabeçalho (Médico, Hospital, Data, Atendente).");
            return;
        }

        const doctorName = doctors.find(d => d.id === patient.doctorId)?.name || selectedDoctor?.name || 'Médico';
        const hospitalName = hospitals.find(h => h.id === patient.hospitalId)?.name || selectedHospital?.name || 'Hospital';
        const hospitalObj = hospitals.find(h => h.id === patient.hospitalId) || selectedHospital;
        const hospitalAddress = hospitalObj ? `${hospitalObj.street}, ${hospitalObj.number} - ${hospitalObj.neighborhood || ''}, ${hospitalObj.city}/${hospitalObj.state}` : '';

        const message = `Olá, *${toTitleCase(patient.patientName)}*

Me chamo *${attendantName}*, e falo do Setor de Agendamento da *Daya Gestão Médica*, responsável pela gestão dos pacientes do *${doctorName}*.

Estou entrando em contato para confirmar sua consulta de *${weekDay}*, *${formattedDate}* às *${patient.time}* no *${hospitalName}*, localizado na ${hospitalAddress}

Posso confirmar sua presença?`;

        setWhatsAppMessage(message);
        setPatientToMessage(patient);
        setIsWhatsAppDialogOpen(true);
    };

    const handleConfirmSendWhatsApp = async () => {
        if (!patientToMessage) return;

        // Ensure phone has +55 country code if not present, and remove mask
        let rawPhone = patientToMessage.phone?.replace(/\D/g, '') || "";
        if (!rawPhone) {
            toast.error("Paciente sem telefone cadastrado.");
            return;
        }

        if (rawPhone.length === 11 || rawPhone.length === 10) {
            rawPhone = "+55" + rawPhone;
        } else if (rawPhone.startsWith("55") && rawPhone.length > 11) {
            rawPhone = "+" + rawPhone;
        }

        setIsSending(true);
        try {
            const response = await fetch("/api/utalk/send", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    toPhone: rawPhone,
                    message: whatsAppMessage,
                    contactName: patientToMessage.patientName
                })
            });

            if (!response.ok) {
                const errorData = await response.json();

                // Set local error state instead of saving to DB
                setWhatsappErrors(prev => ({ ...prev, [patientToMessage.id]: true }));
                toast.error(`Erro ao enviar mensagem: ${errorData.error || "Erro desconhecido"}`);
                return;
            }

            // Mark as sent and update status to "Aguardando"
            const updated = await updateConsultation(patientToMessage.id, {
                whatsappSent: true,
                status: "Aguardando"
            });
            setPatients(patients.map(p =>
                p.id === patientToMessage.id ? updated as ConsultationItem : p
            ));

            setWhatsappErrors(prev => ({ ...prev, [patientToMessage.id]: false }));

            setIsWhatsAppDialogOpen(false);
            setPatientToMessage(null);
            toast.success("Mensagem enviada com sucesso!");

        } catch (error) {
            console.error("Erro ao enviar:", error);
            // Set local error state
            setWhatsappErrors(prev => ({ ...prev, [patientToMessage.id]: true }));
            toast.error("Erro de conexão ao tentar enviar mensagem.");
        } finally {
            setIsSending(false);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validation: Required fields
        if (!selectedDoctorId || !selectedHospitalId || !date || !attendantName.trim()) {
            toast.error("Por favor, preencha Médico, Hospital, Data e Atendente antes de importar a lista.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload-consultas", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || "Erro ao processar arquivo");
                return;
            }

            const data = await response.json();

            // Process and save both patients and consultations
            const importedConsultations: ConsultationItem[] = [];

            for (const item of data) {
                const cleanPhone = item.phone?.replace(/\D/g, "") || "";

                // 1. Sync Patient
                const existing = availablePatients.find(p => p.name.toLowerCase() === item.patientName.toLowerCase());
                if (!existing) {
                    await addPatient({
                        name: item.patientName,
                        phone: cleanPhone,
                        insurance: item.insurance || "",
                        plan: "",
                        birthDate: "",
                        gender: "other",
                        cep: "",
                        street: "",
                        number: "",
                        complement: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                        email: "",
                    });
                } else if (existing.phone !== cleanPhone && cleanPhone) {
                    await updatePatient(existing.id, { ...existing, phone: cleanPhone });
                }

                // 2. Add Consultation if not duplicate in current list
                if (!patients.some(p => p.patientName.toLowerCase() === item.patientName.toLowerCase())) {
                    const newItem = await addConsultation({
                        patientName: item.patientName,
                        phone: cleanPhone,
                        time: item.time,
                        date: date || new Date().toISOString().split('T')[0],
                        status: "Pendente",
                        whatsappSent: false,
                        doctorId: selectedDoctorId,
                        hospitalId: selectedHospitalId,
                        insurance: item.insurance || ""
                    });
                    importedConsultations.push(newItem as ConsultationItem);
                }
            }

            if (importedConsultations.length === 0 && data.length > 0) {
                toast.warning("Todos os pacientes do arquivo já estão na lista.");
            } else {
                setPatients(prev => [...prev, ...importedConsultations]);
                toast.success(`${importedConsultations.length} pacientes importados com sucesso!`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Erro ao enviar arquivo.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Agendamento de Consultas</h1>
                <p className="text-muted-foreground">Gerencie a lista de consultas e confirmações via WhatsApp.</p>
            </div>

            <Card className="border-t-4 border-t-primary">
                <CardHeader>
                    <CardTitle>Dados do Agendamento</CardTitle>
                    <CardDescription>Preencha as informações principais para o dia de atendimento.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Médico</label>
                        <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o médico" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((doctor) => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                        {doctor.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hospital/Clínica</label>
                        <Select value={selectedHospitalId} onValueChange={setSelectedHospitalId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o local" />
                            </SelectTrigger>
                            <SelectContent>
                                {hospitals.map((hospital) => (
                                    <SelectItem key={hospital.id} value={hospital.id}>
                                        {hospital.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Data da Consulta</label>
                        <div className="relative">
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            {weekDay && (
                                <span className="absolute right-3 top-2.5 text-xs font-semibold text-muted-foreground bg-background px-1">
                                    {weekDay}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nome do Atendente</label>
                        <Input
                            placeholder="Seu nome"
                            value={attendantName}
                            onChange={(e) => setAttendantName(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Lista de Pacientes</CardTitle>
                        <CardDescription>Adicione os pacientes agendados para este dia.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="file"
                            accept=".pdf, .jpg, .jpeg, .png, .webp"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />

                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {isUploading ? "Processando..." : "Importar Arquivo"}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setIsFilterSidebarOpen(true)}
                            className="relative"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Filtrar
                            {(filterDoctorId !== "all" || filterHospitalId !== "all" || filterDate) && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                            )}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => setIsClearDialogOpen(true)}
                            disabled={patients.length === 0}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Limpar Lista
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add Patient Field */}
                    {/* Add Patient Field */}
                    <div className="grid gap-4 md:grid-cols-[1fr_150px_100px_100px] items-end border p-4 rounded-lg bg-muted/20">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nome do Paciente</label>
                            <div className="relative">
                                <div className="flex items-center">
                                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <Input
                                        placeholder="Nome completo"
                                        value={newPatientName}
                                        onChange={(e) => {
                                            setNewPatientName(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                </div>
                                {showSuggestions && newPatientName && filteredPatients.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
                                        {filteredPatients.map((patient) => (
                                            <div
                                                key={patient.id}
                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-slate-100"
                                                onClick={() => handleSelectPatient(patient)}
                                            >
                                                <div className="font-medium">{patient.name}</div>
                                                <div className="text-xs text-muted-foreground">{patient.phone}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Telefone</label>
                            <div className="flex items-center">
                                <MessageCircle className="w-4 h-4 mr-2 text-muted-foreground" />
                                <Input
                                    placeholder="(99) 99999-9999"
                                    value={newPatientPhone}
                                    maxLength={15}
                                    onChange={(e) => setNewPatientPhone(formatPhone(e.target.value))}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Horário</label>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                                <Input
                                    type="time"
                                    value={newPatientTime}
                                    onChange={(e) => setNewPatientTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {editingPatientId && (
                                <Button variant="ghost" onClick={handleCancelEdit}>
                                    Cancelar
                                </Button>
                            )}
                            <Button onClick={handleAddPatient} disabled={!newPatientName || !newPatientTime}>
                                {editingPatientId ? (
                                    <>
                                        <Pencil className="w-4 h-4 mr-2" />
                                        Atualizar
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Adicionar
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Patient List */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Horário</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Convênio</TableHead>
                                    <TableHead>Hospital</TableHead>
                                    <TableHead>Médico</TableHead>
                                    <TableHead className="w-[150px]">Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingConsultations ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                            <p className="mt-2 text-sm text-muted-foreground">Carregando consultas...</p>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredConsultations.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Nenhuma consulta encontrada.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredConsultations
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell className="font-medium">{patient.time}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span>{patient.patientName}</span>
                                                        <span className="text-xs text-muted-foreground">{formatPhone(patient.phone || "")}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{patient.insurance}</TableCell>
                                                <TableCell>{hospitals.find(h => h.id === patient.hospitalId)?.name || "-"}</TableCell>
                                                <TableCell>{doctors.find(d => d.id === patient.doctorId)?.name || "-"}</TableCell>
                                                <TableCell>
                                                    <Select
                                                        value={patient.status}
                                                        onValueChange={(val) => handleStatusChange(patient.id, val)}
                                                    >
                                                        <SelectTrigger
                                                            className={`h-9 w-full text-[10px]  font-bold uppercase transition-all border ${patient.status === 'Confirmada' ? 'bg-green-50 border-green-200 text-green-700' :
                                                                patient.status === 'Cancelada' ? 'bg-red-50 border-red-200 text-red-700' :
                                                                    patient.status === 'Aguardando' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                        'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                                } hover:opacity-80`}
                                                        >
                                                            <SelectValue placeholder="Status" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Pendente">Pendente</SelectItem>
                                                            <SelectItem value="Aguardando">Aguardando</SelectItem>
                                                            <SelectItem value="Confirmada">Confirmada</SelectItem>
                                                            <SelectItem value="Cancelada">Cancelada</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    <Button
                                                        variant={patient.whatsappSent ? "default" : "outline"}
                                                        size="sm"
                                                        className={
                                                            patient.whatsappSent ? "bg-green-600 hover:bg-green-700" :
                                                                whatsappErrors[patient.id] ? "bg-red-600 text-white hover:bg-red-700 border-red-600" :
                                                                    "text-green-600 border-green-200 hover:bg-green-50"
                                                        }
                                                        onClick={() => handleOpenWhatsAppDialog(patient)}
                                                        disabled={patient.whatsappSent}
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                        {patient.whatsappSent ? "Enviado" : whatsappErrors[patient.id] ? "Erro ao Enviar" : "WhatsApp"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        onClick={() => handleEditPatient(patient)}
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => handleDeletePatient(patient.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <AlertDialog open={isWhatsAppDialogOpen} onOpenChange={setIsWhatsAppDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar Envio</AlertDialogTitle>
                        <AlertDialogDescription>
                            Revise a mensagem antes de enviar para o WhatsApp.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                        <Textarea
                            value={whatsAppMessage}
                            onChange={(e) => setWhatsAppMessage(e.target.value)}
                            rows={10}
                            className="resize-none"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => {
                            e.preventDefault(); // Prevent auto-close
                            handleConfirmSendWhatsApp();
                        }} disabled={isSending}>
                            <MessageCircle className="w-4 h-4 mr-2" />
                            {isSending ? "Enviando..." : "Enviar Mensagem"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Limpar Lista</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover TODOS os registros da lista? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(e) => {
                                e.preventDefault();
                                handleClearList();
                            }}
                        >
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Sheet open={isFilterSidebarOpen} onOpenChange={setIsFilterSidebarOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle>Filtros</SheetTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setFilterDoctorId("all");
                                    setFilterHospitalId("all");
                                    setFilterDate("");
                                }}
                                className="text-xs h-8"
                            >
                                <X className="w-3 h-3 mr-1" />
                                Limpar Filtros
                            </Button>
                        </div>
                        <SheetDescription>
                            Refine a lista de consultas selecionando os critérios abaixo.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6">
                        <div className="space-y-2">
                            <Label>Médico</Label>
                            <Select value={filterDoctorId} onValueChange={setFilterDoctorId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os Médicos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Médicos</SelectItem>
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Hospital</Label>
                            <Select value={filterHospitalId} onValueChange={setFilterHospitalId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os Hospitais" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Hospitais</SelectItem>
                                    {hospitals.map(h => (
                                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Data da Consulta</Label>
                            <Input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <SheetFooter className="mt-6">
                        <SheetClose asChild>
                            <Button className="w-full">Ver Resultado</Button>
                        </SheetClose>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
