"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
    Calendar as CalendarIcon,
    User,
    Building2,
    Clock,
    MessageCircle,
    Plus,
    Trash2,
    Pencil
} from "lucide-react";

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

import { useDoctors } from "@/context/doctor-context";
import { useHospitals } from "@/context/hospital-context";
import { usePatients } from "@/context/patient-context";
import { ConsultationItem } from "@/types";
import { formatPhone } from "@/lib/utils";
import { toast } from "sonner";

export default function ConsultasPage() {
    const { doctors } = useDoctors();
    const { hospitals } = useHospitals();
    const { patients: availablePatients, addPatient } = usePatients();

    // Form States
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedHospitalId, setSelectedHospitalId] = useState<string>("");
    const [date, setDate] = useState<string>("");
    const [attendantName, setAttendantName] = useState<string>("");

    // List State
    const [patients, setPatients] = useState<ConsultationItem[]>([]);
    const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

    // New Patient Input States
    const [newPatientName, setNewPatientName] = useState("");
    const [newPatientPhone, setNewPatientPhone] = useState("");
    const [newPatientTime, setNewPatientTime] = useState("");

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

    const [showSuggestions, setShowSuggestions] = useState(false);

    // WhatsApp Dialog State
    const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
    const [whatsAppMessage, setWhatsAppMessage] = useState("");
    const [patientToMessage, setPatientToMessage] = useState<ConsultationItem | null>(null);
    const [isSending, setIsSending] = useState(false);

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

    const handleAddPatient = () => {
        if (!newPatientName || !newPatientTime) return;

        if (editingPatientId) {
            setPatients(patients.map(p => {
                if (p.id === editingPatientId) {
                    return {
                        ...p,
                        patientName: newPatientName,
                        phone: newPatientPhone.replace(/\D/g, ""),
                        time: newPatientTime
                    };
                }
                return p;
            }));
            handleCancelEdit();
            return;
        }

        // Prevent Adding Duplicate Patient
        if (patients.some(p => p.patientName.toLowerCase() === newPatientName.toLowerCase())) {
            toast.warning("Este paciente já foi adicionado à lista.");
            return;
        }

        // Check if patient exists, if not, save it
        const patientExists = availablePatients.some(
            p => p.name.toLowerCase() === newPatientName.toLowerCase()
        );

        if (!patientExists) {
            addPatient({
                name: newPatientName,
                phone: newPatientPhone.replace(/\D/g, ""),
                // Default values for required fields
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
            });
        }

        const newPatient: ConsultationItem = {
            id: Math.random().toString(36).substr(2, 9),
            patientName: newPatientName,
            phone: newPatientPhone.replace(/\D/g, ""),
            status: "Pendente",
            time: newPatientTime,
            whatsappSent: false
        };

        setPatients([...patients, newPatient]);
        setNewPatientName("");
        setNewPatientPhone("");
        setNewPatientTime("");
    };

    const handleDeletePatient = (id: string) => {
        setPatients(patients.filter(p => p.id !== id));
    };

    const handleOpenWhatsAppDialog = (patient: ConsultationItem) => {
        if (!selectedDoctor || !selectedHospital || !date || !attendantName) {
            toast.warning("Por favor, preencha todos os campos do cabeçalho (Médico, Hospital, Data, Atendente).");
            return;
        }

        const hospitalAddress = `${selectedHospital.street}, ${selectedHospital.number} - ${selectedHospital.neighborhood || ''}, ${selectedHospital.city}/${selectedHospital.state}`;

        const message = `Bom dia Sr(a). *${patient.patientName}*!

Me chamo *${attendantName}*, e falo do Setor de Agendamento da *Daya Gestão Médica*, responsável pela gestão dos pacientes do *~${selectedDoctor.name}*.

Estou entrando em contato para confirmar sua consulta de *${weekDay}*, *${formattedDate}* às *${patient.time}* no *${selectedHospital.name}*, localizado na ${hospitalAddress}

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

        // Basic formatting to ensure +55 (assuming BR number for now based on user context)
        // If it starts with 55, add +, if not, add +55.
        // Actually the user example had +55.
        // If the stored phone is just 31987205436 (11 digits), we need to add +55.
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

                // Update status to "Erro" on API failure
                setPatients(patients.map(p =>
                    p.id === patientToMessage.id ? { ...p, status: "Erro" } : p
                ));

                toast.error(`Erro ao enviar mensagem: ${errorData.error || "Erro desconhecido"}`);
                return;
            }

            // Mark as sent and update status
            setPatients(patients.map(p =>
                p.id === patientToMessage.id ? { ...p, whatsappSent: true, status: "Enviado" } : p
            ));

            setIsWhatsAppDialogOpen(false);
            setPatientToMessage(null);
            toast.success("Mensagem enviada com sucesso!");

        } catch (error) {
            console.error("Erro ao enviar:", error);

            // Update status to "Erro" on exception
            setPatients(patients.map(p =>
                p.id === patientToMessage.id ? { ...p, status: "Erro" } : p
            ));

            toast.error("Erro de conexão ao tentar enviar mensagem.");
        } finally {
            setIsSending(false);
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
                                    <TableHead>Telefone</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            Nenhum paciente adicionado ainda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    patients
                                        .sort((a, b) => a.time.localeCompare(b.time))
                                        .map((patient) => (
                                            <TableRow key={patient.id}>
                                                <TableCell className="font-medium">{patient.time}</TableCell>
                                                <TableCell>{patient.patientName}</TableCell>
                                                <TableCell>{formatPhone(patient.phone || "")}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="secondary"
                                                        className={`font-normal ${patient.status === 'Enviado' ? 'bg-green-100 text-green-700 hover:bg-green-100' :
                                                            patient.status === 'Erro' ? 'bg-red-100 text-red-700 hover:bg-red-100' : ''
                                                            }`}
                                                    >
                                                        {patient.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    <Button
                                                        variant={patient.whatsappSent ? "default" : "outline"}
                                                        size="sm"
                                                        className={patient.whatsappSent ? "bg-green-600 hover:bg-green-700" : "text-green-600 border-green-200 hover:bg-green-50"}
                                                        onClick={() => handleOpenWhatsAppDialog(patient)}
                                                        disabled={patient.whatsappSent || patient.status === "Erro"}
                                                    >
                                                        <MessageCircle className="w-4 h-4 mr-2" />
                                                        {patient.whatsappSent ? "Enviado" : "WhatsApp"}
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
        </div>
    );
}
