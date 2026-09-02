"use client";

import { useState, useMemo } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Copy, ExternalLink, Check, Loader2, FileText, Phone, User, DollarSign, Send, Save, MessageSquare, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { DOCTORS_MAPPING, LOCATIONS_MAPPING } from "@/lib/constants/scheduling";
import { buildWhatsAppMessage, buildWhatsAppDeepLink, sanitizePhoneNumber, formatFullExtendedDate } from "@/lib/scheduling-utils";
import { createAppointment } from "@/app/actions/appointments";
import { formatPhone, toTitleCase } from "@/lib/utils";
import { toast } from "sonner";
import { useDoctors } from "@/context/doctor-context";
import { usePatients } from "@/context/patient-context";
import { useSession } from "next-auth/react";
import { Appointment } from "@/types";

interface AppointmentFormProps {
    onAppointmentCreated?: (appointment: Appointment) => void;
}

interface PendingAppointment {
    trimmedPatientName: string;
    cleanPhone: string;
    finalInsurance: string;
    finalPlan: string;
    finalAmount: string;
    fullDatetimeString: string;
    message: string;
}

export function AppointmentForm({ onAppointmentCreated }: AppointmentFormProps) {
    const { data: session } = useSession();
    const { doctors: dbDoctors } = useDoctors();
    const { patients: availablePatients, addPatient } = usePatients();

    // Default today's date formatted as YYYY-MM-DD
    const todayStr = useMemo(() => {
        const d = new Date();
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }, []);

    // Form States
    const [patientName, setPatientName] = useState("");
    const [patientPhone, setPatientPhone] = useState("");
    const [appointmentType, setAppointmentType] = useState<"Convênio" | "Particular">("Convênio");
    const [insurance, setInsurance] = useState("");
    const [plan, setPlan] = useState("");
    const [amount, setAmount] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [doctorName, setDoctorName] = useState("Dr. Jader de Andrade");
    const [appointmentDate, setAppointmentDate] = useState(todayStr);
    const [appointmentTime, setAppointmentTime] = useState("09:00");
    const [locationName, setLocationName] = useState("Clínica CEOT");
    const [fromWebsite, setFromWebsite] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal Confirmation State
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [pendingAppointment, setPendingAppointment] = useState<PendingAppointment | null>(null);
    const [copiedMessage, setCopiedMessage] = useState(false);

    // Live search filtered patients from DB (minimum 3 characters)
    const filteredPatients = useMemo(() => {
        if (!patientName || patientName.trim().length < 3) return [];
        const term = patientName.toLowerCase().trim();
        return availablePatients
            .filter((p) => p.name.toLowerCase().includes(term))
            .slice(0, 6);
    }, [patientName, availablePatients]);

    // Doctor options loaded directly from Doctor database table
    const doctorOptions = useMemo(() => {
        if (dbDoctors && dbDoctors.length > 0) {
            return dbDoctors.filter((d) => d.status !== "inactive").map((d) => d.name);
        }
        return DOCTORS_MAPPING.map((d) => d.name);
    }, [dbDoctors]);

    // Automatic Specialty Mapping
    const mappedSpecialty = useMemo(() => {
        const matchedDoctor = DOCTORS_MAPPING.find((d) => d.name === doctorName);
        if (matchedDoctor) return matchedDoctor.specialty;

        const matchedDbDoctor = dbDoctors.find((d) => d.name === doctorName);
        if (matchedDbDoctor && matchedDbDoctor.specialty) return matchedDbDoctor.specialty;

        return "Ortopedia (Especialista em Coluna)";
    }, [doctorName, dbDoctors]);

    // Automatic Address Mapping
    const mappedAddress = useMemo(() => {
        const matchedLoc = LOCATIONS_MAPPING.find((l) => l.name === locationName);
        if (matchedLoc) return matchedLoc.address;
        return "Rua São Paulo, 1818, Lourdes - BH/MG";
    }, [locationName]);

    // Live preview of formatted extended date string
    const previewExtendedDate = useMemo(() => {
        if (!appointmentDate || !appointmentTime) return "";
        return formatFullExtendedDate(appointmentDate, appointmentTime);
    }, [appointmentDate, appointmentTime]);

    // Format phone mask on input change
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setPatientPhone(formatPhone(val));
    };

    // Step 1: Form Validation & Open Confirmation Modal
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!patientName.trim()) {
            toast.error("Por favor, preencha o Nome do Paciente.");
            return;
        }

        const { clean, isValid } = sanitizePhoneNumber(patientPhone);
        if (!patientPhone.trim() || !isValid) {
            toast.error("Por favor, informe um telefone/WhatsApp válido com DDD (ex: (31) 98765-4321).");
            return;
        }

        if (!doctorName) {
            toast.error("Por favor, selecione um Médico.");
            return;
        }

        if (!appointmentDate) {
            toast.error("Por favor, selecione a Data da consulta.");
            return;
        }

        if (!appointmentTime) {
            toast.error("Por favor, selecione o Horário da consulta.");
            return;
        }

        if (!locationName) {
            toast.error("Por favor, selecione o Local de Atendimento.");
            return;
        }

        if (appointmentType === "Particular" && !amount.trim()) {
            toast.error("Por favor, informe o valor da consulta particular.");
            return;
        }

        const trimmedPatientName = patientName.trim();
        const finalInsurance = appointmentType === "Particular" ? "Particular" : insurance;
        const finalPlan = appointmentType === "Particular" ? "" : plan;
        const finalAmount = appointmentType === "Particular" ? amount : "";

        // Build WhatsApp message text
        const { fullDatetimeString, message } = buildWhatsAppMessage({
            patientName: trimmedPatientName,
            doctorName,
            specialty: mappedSpecialty,
            dateStr: appointmentDate,
            timeStr: appointmentTime,
            locationName,
            locationAddress: mappedAddress,
            appointmentType,
            amount: finalAmount,
        });

        setPendingAppointment({
            trimmedPatientName,
            cleanPhone: clean,
            finalInsurance,
            finalPlan,
            finalAmount,
            fullDatetimeString,
            message,
        });
        setCopiedMessage(false);
        setIsConfirmModalOpen(true);
    };

    // Copy message inside modal
    const handleCopyModalMessage = async () => {
        if (!pendingAppointment?.message) return;
        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(pendingAppointment.message);
                setCopiedMessage(true);
                toast.success("Mensagem copiada para a área de transferência!");
                setTimeout(() => setCopiedMessage(false), 3000);
            }
        } catch (err) {
            toast.error("Erro ao copiar mensagem.");
        }
    };

    // Step 2: Execute Save (With or Without sending message)
    const handleSaveAppointment = async (sendWhatsApp: boolean) => {
        if (!pendingAppointment) return;

        setIsSubmitting(true);

        try {
            const {
                trimmedPatientName,
                cleanPhone,
                finalInsurance,
                finalPlan,
                finalAmount,
                fullDatetimeString,
                message,
            } = pendingAppointment;

            // Auto-register patient if not existing
            const existingPatient = availablePatients.find(
                (p) => p.name.toLowerCase().trim() === trimmedPatientName.toLowerCase()
            );

            if (!existingPatient) {
                try {
                    await addPatient({
                        name: trimmedPatientName,
                        phone: cleanPhone,
                        gender: "other",
                        insurance: finalInsurance || "Particular",
                        plan: finalPlan || "",
                        birthDate: "",
                        cep: "",
                        street: "",
                        number: "",
                        complement: "",
                        neighborhood: "",
                        city: "",
                        state: "",
                        email: "",
                    });
                } catch (patErr) {
                    console.error("Erro ao salvar novo paciente:", patErr);
                }
            }

            const createdByUser = fromWebsite
                ? "Site"
                : (session?.user?.name || session?.user?.email || "Usuário do Sistema");

            const newAppointment = await createAppointment({
                patientName: trimmedPatientName,
                patientPhone: cleanPhone,
                insurance: finalInsurance,
                plan: finalPlan,
                appointmentType,
                amount: finalAmount,
                doctorName,
                specialty: mappedSpecialty,
                appointmentDate,
                appointmentTime,
                fullDatetimeString,
                locationName,
                locationAddress: mappedAddress,
                fromWebsite,
                whatsappMessage: message,
                whatsappSent: sendWhatsApp,
                status: "AGENDADO",
                createdBy: createdByUser,
            });

            if (!sendWhatsApp) {
                toast.success("Consulta agendada no sistema sem envio de mensagem.");
            } else {
                // Copy message to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(message);
                }

                // Prepare phone for uTalk (+55...)
                let toPhone = cleanPhone;
                if (toPhone.length === 10 || toPhone.length === 11) {
                    toPhone = "+55" + toPhone;
                } else if (toPhone.startsWith("55") && toPhone.length >= 12) {
                    toPhone = "+" + toPhone;
                } else if (!toPhone.startsWith("+")) {
                    toPhone = "+" + toPhone;
                }

                // Send via uTalk API
                let utalkSuccess = false;
                try {
                    const utalkRes = await fetch("/api/utalk/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            toPhone,
                            message,
                            contactName: trimmedPatientName,
                            doctorName,
                        }),
                    });

                    if (utalkRes.ok) {
                        utalkSuccess = true;
                        toast.success("Consulta agendada! Mensagem enviada via WhatsApp e copiada para a área de transferência.");
                    } else {
                        const errData = await utalkRes.json().catch(() => ({}));
                        toast.warning(`Agendado e copiado! Erro uTalk (${errData.error || "Erro de API"}). Abrindo WhatsApp Web...`);
                    }
                } catch (utalkErr) {
                    console.error("Erro ao chamar uTalk API:", utalkErr);
                    toast.warning("Agendado e copiado! Não foi possível se conectar à API uTalk. Abrindo WhatsApp Web...");
                }

                // Fallback: Open WhatsApp Deep Link if uTalk fails
                if (!utalkSuccess) {
                    const deepLink = buildWhatsAppDeepLink(cleanPhone, message);
                    window.open(deepLink, "_blank", "noopener,noreferrer");
                }
            }

            // Reset form fields
            setPatientName("");
            setPatientPhone("");
            setInsurance("");
            setPlan("");
            setAmount("");
            setAppointmentType("Convênio");
            setShowSuggestions(false);
            setIsConfirmModalOpen(false);
            setPendingAppointment(null);

            if (onAppointmentCreated) {
                onAppointmentCreated(newAppointment);
            }
        } catch (error: any) {
            console.error("Erro ao agendar consulta:", error);
            toast.error(error.message || "Erro ao agendar consulta. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Card className="w-full max-w-3xl mx-auto shadow-sm border border-slate-200 bg-white dark:bg-slate-900">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        Agendamento de Consulta
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                        Preencha os dados da consulta para visualizar a mensagem formatada e confirmar o agendamento.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Toggle: Paciente veio do site? */}
                        <div className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
                            <div className="space-y-0.5">
                                <Label htmlFor="fromWebsite" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                    Paciente veio do site?
                                </Label>
                            </div>
                            <Switch
                                id="fromWebsite"
                                checked={fromWebsite}
                                onChange={(e) => setFromWebsite(e.target.checked)}
                            />
                        </div>

                        {/* Nome do Paciente & Telefone / WhatsApp */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Nome do Paciente */}
                            <div className="space-y-1.5 relative">
                                <Label htmlFor="patientName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Nome do Paciente <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="patientName"
                                        type="text"
                                        value={patientName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPatientName(val);
                                            setShowSuggestions(true);
                                            const match = availablePatients.find(
                                                (p) => p.name.toLowerCase() === val.trim().toLowerCase()
                                            );
                                            if (match) {
                                                if (match.phone) setPatientPhone(formatPhone(match.phone));
                                                if (match.insurance) setInsurance(match.insurance);
                                                if (match.plan) setPlan(match.plan);
                                            }
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        onBlur={() => {
                                            setTimeout(() => setShowSuggestions(false), 200);
                                            if (patientName.trim()) {
                                                const match = availablePatients.find(
                                                    (p) => p.name.toLowerCase() === patientName.trim().toLowerCase()
                                                );
                                                if (match) {
                                                    if (match.phone) setPatientPhone(formatPhone(match.phone));
                                                    if (match.insurance) setInsurance(match.insurance);
                                                    if (match.plan) setPlan(match.plan);
                                                }
                                            }
                                        }}
                                        placeholder="Digite o nome do paciente..."
                                        className="pl-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                        required
                                        autoComplete="off"
                                    />
                                </div>

                                {/* Autocomplete Suggestions Dropdown */}
                                {showSuggestions && filteredPatients.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto py-1">
                                        {filteredPatients.map((p) => (
                                            <button
                                                key={p.id}
                                                type="button"
                                                className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 dark:hover:bg-slate-700 flex justify-between items-center transition-colors cursor-pointer border-b last:border-0 border-slate-100 dark:border-slate-700/50"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setPatientName(p.name);
                                                    if (p.phone) setPatientPhone(formatPhone(p.phone));
                                                    if (p.insurance) setInsurance(p.insurance);
                                                    if (p.plan) setPlan(p.plan);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                <span className="font-semibold text-slate-800 dark:text-slate-200">{toTitleCase(p.name)}</span>
                                                <span className="text-slate-400 text-[11px]">{formatPhone(p.phone)}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Telefone / WhatsApp */}
                            <div className="space-y-1.5">
                                <Label htmlFor="patientPhone" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Telefone / WhatsApp <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        id="patientPhone"
                                        type="text"
                                        value={patientPhone}
                                        onChange={handlePhoneChange}
                                        placeholder="(31) 98765-4321"
                                        className="pl-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Tipo de Consulta & Detalhes (Convênio / Plano / Valor) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                            {/* Tipo de Consulta (Convênio vs Particular) */}
                            <div className="space-y-1.5">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Tipo de Consulta <span className="text-red-500">*</span>
                                </Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppointmentType("Convênio");
                                            if (insurance === "Particular") setInsurance("");
                                        }}
                                        className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            appointmentType === "Convênio"
                                                ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs"
                                                : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                        }`}
                                    >
                                        <span>🏥</span> Convênio
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAppointmentType("Particular");
                                            setInsurance("Particular");
                                            setPlan("");
                                        }}
                                        className={`py-2 px-3 rounded-xl text-sm font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            appointmentType === "Particular"
                                                ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs"
                                                : "bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                                        }`}
                                    >
                                        <span>💵</span> Particular
                                    </button>
                                </div>
                            </div>

                            {/* Exibição Condicional: Convênio & Plano vs Valor da Consulta */}
                            {appointmentType === "Convênio" ? (
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="insurance" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Convênio
                                        </Label>
                                        <Input
                                            id="insurance"
                                            type="text"
                                            value={insurance}
                                            onChange={(e) => setInsurance(e.target.value)}
                                            placeholder="Ex: Unimed"
                                            className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="plan" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Plano
                                        </Label>
                                        <Input
                                            id="plan"
                                            type="text"
                                            value={plan}
                                            onChange={(e) => setPlan(e.target.value)}
                                            placeholder="Ex: Especial"
                                            className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <Label htmlFor="amount" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                            Valor da Consulta (R$) <span className="text-red-500">*</span>
                                        </Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                                    title="Ver Tabela de Valores por Profissional"
                                                >
                                                    <HelpCircle className="h-4 w-4" />
                                                </button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-80 p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl text-xs space-y-2.5 z-50">
                                                <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 border-b pb-2 text-xs">
                                                    <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                    <span>Tabela de Valores de Consulta</span>
                                                </div>

                                                <div className="space-y-2.5 text-slate-700 dark:text-slate-300 max-h-72 overflow-y-auto pr-1">
                                                    {/* Dr. Jader */}
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[12px]">Dr. Jader</span>
                                                        <div className="pl-2 space-y-0.5 text-[11px] mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("650,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Presencial</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 650,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("800,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• On-line</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 800,00</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Dr. Sávio */}
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[12px]">Dr. Sávio</span>
                                                        <div className="pl-2 space-y-0.5 text-[11px] mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("850,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Presencial</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 850,00</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Dra. Iara */}
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[12px]">Dra. Iara</span>
                                                        <div className="pl-2 space-y-0.5 text-[11px] mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("600,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• 1º Consulta</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 600,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("450,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Para pacientes</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 450,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("350,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Paciente SUS</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 350,00</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Dr. Tiago */}
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[12px]">Dr. Tiago</span>
                                                        <div className="pl-2 space-y-0.5 text-[11px] mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("600,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Presencial</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 600,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("600,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• On-line</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 600,00</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Dr. Rômulo */}
                                                    <div>
                                                        <span className="font-semibold text-slate-900 dark:text-slate-100 block text-[12px]">Dr. Rômulo</span>
                                                        <div className="pl-2 space-y-0.5 text-[11px] mt-0.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("350,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Numai</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 350,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("350,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Centra</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 350,00</span>
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setAmount("550,00")}
                                                                className="w-full text-left flex justify-between items-center hover:bg-slate-100 dark:hover:bg-slate-800 p-1 rounded transition-colors cursor-pointer"
                                                            >
                                                                <span>• Biocor</span>
                                                                <span className="font-semibold text-emerald-600 dark:text-emerald-400">R$ 550,00</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-1 border-t text-center italic">
                                                    Clique num valor para preencher automaticamente.
                                                </p>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input
                                            id="amount"
                                            type="text"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Ex: 350,00"
                                            required={appointmentType === "Particular"}
                                            className="pl-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Médico & Especialidade (Automático) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Médico */}
                            <div className="space-y-1.5">
                                <Label htmlFor="doctorName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Médico <span className="text-red-500">*</span>
                                </Label>
                                <Select value={doctorName} onValueChange={setDoctorName}>
                                    <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 text-slate-900 dark:text-slate-100">
                                        <SelectValue placeholder="Selecione o médico" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {doctorOptions.map((doc) => (
                                            <SelectItem key={doc} value={doc}>
                                                {doc}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Especialidade (Automático) */}
                            <div className="space-y-1.5">
                                <Label htmlFor="specialty" className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                    Especialidade (Automático)
                                </Label>
                                <Input
                                    id="specialty"
                                    type="text"
                                    value={mappedSpecialty}
                                    disabled
                                    className="bg-slate-100 dark:bg-slate-800/60 border-slate-200 text-slate-500 dark:text-slate-400 cursor-not-allowed font-normal"
                                />
                            </div>
                        </div>

                        {/* Data & Horário */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Data */}
                            <div className="space-y-1.5">
                                <Label htmlFor="appointmentDate" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Data (Clique no Calendário 🗓️) <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="appointmentDate"
                                        type="date"
                                        value={appointmentDate}
                                        onChange={(e) => setAppointmentDate(e.target.value)}
                                        className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100 pr-10"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Horário */}
                            <div className="space-y-1.5">
                                <Label htmlFor="appointmentTime" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                    Horário <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="appointmentTime"
                                        type="time"
                                        value={appointmentTime}
                                        onChange={(e) => setAppointmentTime(e.target.value)}
                                        className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100 pr-10"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Local de Atendimento */}
                        <div className="space-y-1.5">
                            <Label htmlFor="locationName" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Local de Atendimento <span className="text-red-500">*</span>
                            </Label>
                            <Select value={locationName} onValueChange={setLocationName}>
                                <SelectTrigger className="bg-slate-50/50 dark:bg-slate-800 border-slate-200 text-slate-900 dark:text-slate-100">
                                    <SelectValue placeholder="Selecione o local" />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOCATIONS_MAPPING.map((loc) => (
                                        <SelectItem key={loc.name} value={loc.name}>
                                            {loc.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 pt-1 px-0.5">
                                <span className="text-red-500 text-sm">📍</span>
                                <span>{mappedAddress}</span>
                            </div>
                        </div>

                        {/* Preview de Data por Extenso */}
                        {previewExtendedDate && (
                            <div className="p-2.5 rounded-md bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                                <CalendarIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-medium">Formato da Mensagem:</span> {previewExtendedDate}
                                </div>
                            </div>
                        )}

                        {/* Botão de Agendar Consulta */}
                        <Button
                            type="submit"
                            disabled={appointmentType === "Particular" && !amount.trim()}
                            className={`w-full font-medium py-3 h-12 rounded-xl text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                appointmentType === "Particular" && !amount.trim()
                                    ? "bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                                    : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.99]"
                            }`}
                        >
                            <span className="text-lg">📋</span>
                            Agendar Consulta
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Modal de Pré-visualização da Mensagem e Confirmação */}
            <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
                <DialogContent className="sm:max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            Pré-visualização do Agendamento
                        </DialogTitle>
                        <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                            Confira os dados e o texto da mensagem antes de salvar o agendamento no sistema.
                        </DialogDescription>
                    </DialogHeader>

                    {pendingAppointment && (
                        <div className="space-y-4 py-2">
                            {/* Resumo do Agendamento */}
                            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                    👤 Paciente: {pendingAppointment.trimmedPatientName} ({formatPhone(pendingAppointment.cleanPhone)})
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">
                                    ⚕️ Médico: {doctorName} • {mappedSpecialty}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">
                                    📅 {pendingAppointment.fullDatetimeString}
                                </div>
                                <div className="text-slate-600 dark:text-slate-400">
                                    🏥 {locationName} - {mappedAddress}
                                </div>
                            </div>

                            {/* Mensagem Formatada WhatsApp */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                        <span>💬 Mensagem a ser exibida/enviada:</span>
                                    </Label>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopyModalMessage}
                                        className="h-7 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 gap-1 px-2"
                                    >
                                        {copiedMessage ? (
                                            <>
                                                <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-3.5 w-3.5" />
                                                Copiar texto
                                            </>
                                        )}
                                    </Button>
                                </div>
                                <div className="p-3.5 rounded-xl bg-slate-900 text-slate-100 font-sans text-xs whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto border border-slate-800 shadow-inner">
                                    {pendingAppointment.message}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex flex-col gap-2 sm:flex-col sm:space-x-0 pt-2">
                        {/* Opção 1: Enviar Mensagem e Salvar */}
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            onClick={() => handleSaveAppointment(true)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 h-11 rounded-xl text-sm shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Enviar mensagem e Salvar registro
                                </>
                            )}
                        </Button>

                        {/* Opção 2: Não Enviar Mensagem e Salvar */}
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            variant="outline"
                            onClick={() => handleSaveAppointment(false)}
                            className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium py-2.5 h-11 rounded-xl text-sm flex items-center justify-center gap-2 cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    Não enviar mensagem e Salvar registro
                                </>
                            )}
                        </Button>

                        {/* Opção 3: Cancelar / Voltar */}
                        <Button
                            type="button"
                            disabled={isSubmitting}
                            variant="ghost"
                            onClick={() => setIsConfirmModalOpen(false)}
                            className="w-full text-slate-500 hover:text-slate-700 text-xs py-1.5 h-8 cursor-pointer"
                        >
                            Voltar e Editar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
