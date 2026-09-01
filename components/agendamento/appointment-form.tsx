"use client";

import { useState, useMemo, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, MapPin, Copy, ExternalLink, Check, Loader2, FileText, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DOCTORS_MAPPING, LOCATIONS_MAPPING } from "@/lib/constants/scheduling";
import { buildWhatsAppMessage, buildWhatsAppDeepLink, sanitizePhoneNumber, formatFullExtendedDate } from "@/lib/scheduling-utils";
import { createAppointment } from "@/app/actions/appointments";
import { formatPhone } from "@/lib/utils";
import { toast } from "sonner";
import { useDoctors } from "@/context/doctor-context";
import { usePatients } from "@/context/patient-context";
import { useSession } from "next-auth/react";
import { Appointment } from "@/types";

interface AppointmentFormProps {
    onAppointmentCreated?: (appointment: Appointment) => void;
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
    const [insurance, setInsurance] = useState("");
    const [plan, setPlan] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [doctorName, setDoctorName] = useState("Dr. Jader de Andrade");
    const [appointmentDate, setAppointmentDate] = useState(todayStr);
    const [appointmentTime, setAppointmentTime] = useState("09:00");
    const [locationName, setLocationName] = useState("Clínica CEOT");
    const [fromWebsite, setFromWebsite] = useState(false);
    const [dontSendWhatsApp, setDontSendWhatsApp] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Form Submit Handler
    const handleSubmit = async (e: React.FormEvent) => {
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

        setIsSubmitting(true);

        try {
            // 0. Auto-register patient if not already registered in patients table
            const trimmedPatientName = patientName.trim();
            const existingPatient = availablePatients.find(
                (p) => p.name.toLowerCase().trim() === trimmedPatientName.toLowerCase()
            );

            if (!existingPatient) {
                try {
                    await addPatient({
                        name: trimmedPatientName,
                        phone: clean,
                        gender: "other",
                        insurance: insurance || "Particular",
                        plan: plan || "",
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

            // 1. Build WhatsApp message text
            const { fullDatetimeString, message } = buildWhatsAppMessage({
                patientName: trimmedPatientName,
                doctorName,
                specialty: mappedSpecialty,
                dateStr: appointmentDate,
                timeStr: appointmentTime,
                locationName,
                locationAddress: mappedAddress,
            });


            // Save appointment to DB via Server Action
            const createdByUser = fromWebsite
                ? "Site"
                : (session?.user?.name || session?.user?.email || "Usuário do Sistema");


            const newAppointment = await createAppointment({
                patientName: trimmedPatientName,
                patientPhone: clean,
                insurance,
                plan,
                doctorName,
                specialty: mappedSpecialty,
                appointmentDate,
                appointmentTime,
                fullDatetimeString,
                locationName,
                locationAddress: mappedAddress,
                fromWebsite,
                whatsappMessage: message,
                whatsappSent: !dontSendWhatsApp,
                status: "AGENDADO",
                createdBy: createdByUser,
            });

            if (dontSendWhatsApp) {
                toast.success("Consulta agendada no sistema sem envio de mensagem via WhatsApp.");
            } else {
                // 2. Copy message to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    await navigator.clipboard.writeText(message);
                }

                // 3. Prepare formatted phone number for uTalk API (+55...)
                let toPhone = clean;
                if (toPhone.length === 10 || toPhone.length === 11) {
                    toPhone = "+55" + toPhone;
                } else if (toPhone.startsWith("55") && toPhone.length >= 12) {
                    toPhone = "+" + toPhone;
                } else if (!toPhone.startsWith("+")) {
                    toPhone = "+" + toPhone;
                }

                // 4. Send message directly via uTalk API (same system used in consultations confirmation)
                let utalkSuccess = false;
                try {
                    const utalkRes = await fetch("/api/utalk/send", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            toPhone,
                            message,
                            contactName: patientName.trim(),
                            doctorName,
                        }),

                    });

                    if (utalkRes.ok) {
                        utalkSuccess = true;
                        toast.success("Consulta agendada! Mensagem enviada via uTalk (WhatsApp) e copiada para a área de transferência.");
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
                    const deepLink = buildWhatsAppDeepLink(clean, message);
                    window.open(deepLink, "_blank", "noopener,noreferrer");
                }
            }

            // Reset patient input fields for next entry
            setPatientName("");
            setPatientPhone("");
            setInsurance("");
            setPlan("");
            setDontSendWhatsApp(false);
            setShowSuggestions(false);

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
        <Card className="w-full max-w-xl mx-auto shadow-sm border border-slate-200 bg-white dark:bg-slate-900">
            <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Agendamento de Consulta
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400 text-sm">
                    Preencha os dados da consulta para gravar o agendamento, copiar a mensagem formatada e enviar via WhatsApp.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                                        <span className="font-semibold text-slate-800 dark:text-slate-200">{p.name}</span>
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

                    {/* Convênio & Plano */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="insurance" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Convênio
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="insurance"
                                    type="text"
                                    value={insurance}
                                    onChange={(e) => setInsurance(e.target.value)}
                                    placeholder="Ex: Unimed"
                                    className="pl-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="plan" className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                Plano
                            </Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    id="plan"
                                    type="text"
                                    value={plan}
                                    onChange={(e) => setPlan(e.target.value)}
                                    placeholder="Ex: Especial / Unifácil"
                                    className="pl-9 bg-slate-50/50 dark:bg-slate-800 border-slate-200 focus:bg-white text-slate-900 dark:text-slate-100"
                                />
                            </div>
                        </div>
                    </div>


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

                    {/* Data (Clique no Calendário 🗓️) */}
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

                        {/* Endereço Mapeado com Ícone 📍 */}
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

                    {/* Toggle: Paciente veio do site? */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
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

                    {/* Toggle: Não enviar mensagem por WhatsApp */}
                    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40">
                        <div className="space-y-0.5">
                            <Label htmlFor="dontSendWhatsApp" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                                Não enviar mensagem pelo WhatsApp
                            </Label>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Grava o agendamento no sistema sem disparar a mensagem no WhatsApp
                            </p>
                        </div>
                        <Switch
                            id="dontSendWhatsApp"
                            checked={dontSendWhatsApp}
                            onChange={(e) => setDontSendWhatsApp(e.target.checked)}
                        />
                    </div>


                    {/* Botão de Agendar e Copiar Mensagem */}
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 h-12 rounded-xl text-base shadow-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <span className="text-lg">📋</span>
                                Confirmar Agendamento
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
