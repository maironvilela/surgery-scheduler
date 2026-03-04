"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, MessageCircle, Clock, Plus, Loader2, Upload, Pencil, User, Filter, X, MoreHorizontal, FileText, Archive, Search, Download, FileJson, ImageIcon, Check, ChevronsUpDown } from "lucide-react";
import jsPDF from "jspdf";
import { toPng, toJpeg } from "html-to-image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDoctors } from "@/context/doctor-context";
import { useHospitals } from "@/context/hospital-context";
import { usePatients } from "@/context/patient-context";
import { ConsultationItem } from "@/types";
import { formatPhone, toTitleCase } from "@/lib/utils";
import { toast } from "sonner";
import { getConsultations, addConsultation, updateConsultation, deleteConsultation, deleteAllConsultations } from "@/app/actions/consultations";

function MultiSelectFilter({ title, options, selectedValues, onSelectionChange }: { title: string, options: { value: string, label: string }[], selectedValues: string[], onSelectionChange: (vals: string[]) => void }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between font-normal bg-background">
                    <span className="truncate max-w-[90%]">
                        {title} {selectedValues.length > 0 && `(${selectedValues.length})`}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] sm:w-[500px] p-0" align="start">
                <Command>
                    <CommandInput placeholder={`Filtrar ${title.toLowerCase()}...`} />
                    <CommandList>
                        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
                        <CommandGroup>
                            {options.map(opt => {
                                const isSelected = selectedValues.includes(opt.value);
                                return (
                                    <CommandItem
                                        key={opt.value}
                                        onSelect={() => {
                                            if (isSelected) {
                                                onSelectionChange(selectedValues.filter(v => v !== opt.value));
                                            } else {
                                                onSelectionChange([...selectedValues, opt.value]);
                                            }
                                        }}
                                    >
                                        <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary ${isSelected ? "bg-primary text-primary-foreground" : "opacity-50"}`}>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </div>
                                        {opt.label}
                                    </CommandItem>
                                )
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

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
    const [filterDoctorIds, setFilterDoctorIds] = useState<string[]>([]);
    const [filterHospitalIds, setFilterHospitalIds] = useState<string[]>([]);
    const [filterDate, setFilterDate] = useState<string>("");
    const [filterStatuses, setFilterStatuses] = useState<string[]>([]);

    const [allPatients, setAllPatients] = useState<ConsultationItem[]>([]);
    const [isLoadingAll, setIsLoadingAll] = useState(false);
    const [activeTab, setActiveTab] = useState("agendamento");

    const [historyFilterPatientName, setHistoryFilterPatientName] = useState("");
    const [historyFilterDoctorId, setHistoryFilterDoctorId] = useState<string>("all");
    const [historyFilterHospitalId, setHistoryFilterHospitalId] = useState<string>("all");
    const [historyFilterDate, setHistoryFilterDate] = useState<string>("");
    const [historyFilterInsurance, setHistoryFilterInsurance] = useState<string>("all");
    const [isHistoryFilterSidebarOpen, setIsHistoryFilterSidebarOpen] = useState(false);

    const [tempHistoryFilterDoctorId, setTempHistoryFilterDoctorId] = useState<string>("all");
    const [tempHistoryFilterHospitalId, setTempHistoryFilterHospitalId] = useState<string>("all");
    const [tempHistoryFilterDate, setTempHistoryFilterDate] = useState<string>("");
    const [tempHistoryFilterInsurance, setTempHistoryFilterInsurance] = useState<string>("all");

    const [newPatientName, setNewPatientName] = useState("");
    const [newPatientPhone, setNewPatientPhone] = useState("");
    const [newPatientTime, setNewPatientTime] = useState("");
    const [newPatientInsurance, setNewPatientInsurance] = useState("");
    const [whatsappErrors, setWhatsappErrors] = useState<Record<string, boolean>>({});

    const [exportType, setExportType] = useState<"pdf" | "jpeg" | null>(null);

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            const updated = await updateConsultation(id, { status: newStatus });
            setPatients(patients.map(p => p.id === id ? updated as ConsultationItem : p));
            toast.success("Status atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const handleObservationChange = async (id: string, newObservation: string) => {
        try {
            const updated = await updateConsultation(id, { observations: newObservation });
            setPatients(patients.map(p => p.id === id ? updated as ConsultationItem : p));
            toast.success("Observação atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar observação");
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
        const [year, month, day] = date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const compareDate = new Date(dateObj);
        compareDate.setHours(0, 0, 0, 0);

        if (compareDate.getTime() === today.getTime()) {
            return "hoje";
        } else if (compareDate.getTime() === tomorrow.getTime()) {
            return "amanhã";
        }

        const dayName = format(dateObj, 'EEEE', { locale: ptBR });
        return dayName.toLowerCase();
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
            const matchesDoctor = filterDoctorIds.length === 0 || filterDoctorIds.includes(patient.doctorId || "");
            const matchesHospital = filterHospitalIds.length === 0 || filterHospitalIds.includes(patient.hospitalId || "");
            const matchesDate = !filterDate || (patient.date && patient.date.startsWith(filterDate));
            const matchesStatus = filterStatuses.length === 0 || filterStatuses.some(fs => {
                const s = patient.status?.trim().toLowerCase() || "pendente";
                if (fs === "confirmada") return s === "confirmado" || s === "confirmada";
                if (fs === "cancelada") return s === "cancelado" || s === "cancelada";
                if (fs === "contato invalido") return s === "contato invalido" || s === "contato inválido";
                if (fs === "sem confirmacao") return s === "sem confirmação" || s === "sem confirmacao";
                return s === fs;
            });
            const isNotArchived = !patient.isArchived;
            return matchesDoctor && matchesHospital && matchesDate && matchesStatus && isNotArchived;
        });
    }, [patients, filterDoctorIds, filterHospitalIds, filterDate, filterStatuses]);

    const allInsurances = useMemo(() => {
        const insurances = new Set(allPatients.map(p => p.insurance).filter((i): i is string => Boolean(i)));
        return Array.from(insurances).sort();
    }, [allPatients]);

    const filteredHistoryPatients = useMemo(() => {
        return allPatients.filter(patient => {
            if (!patient.isArchived) return false;

            const matchesName = !historyFilterPatientName || patient.patientName.toLowerCase().includes(historyFilterPatientName.toLowerCase());
            const matchesDoctor = historyFilterDoctorId === "all" || patient.doctorId === historyFilterDoctorId;
            const matchesHospital = historyFilterHospitalId === "all" || patient.hospitalId === historyFilterHospitalId;
            const matchesDate = !historyFilterDate || (patient.date && patient.date.startsWith(historyFilterDate));
            const matchesInsurance = historyFilterInsurance === "all" || patient.insurance === historyFilterInsurance;

            return matchesName && matchesDoctor && matchesHospital && matchesDate && matchesInsurance;
        });
    }, [allPatients, historyFilterPatientName, historyFilterDoctorId, historyFilterHospitalId, historyFilterDate, historyFilterInsurance]);

    const [showSuggestions, setShowSuggestions] = useState(false);

    // WhatsApp Dialog State
    const [isWhatsAppDialogOpen, setIsWhatsAppDialogOpen] = useState(false);
    const [whatsAppMessage, setWhatsAppMessage] = useState("");
    const [patientToMessage, setPatientToMessage] = useState<ConsultationItem | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Observations Dialog State
    const [isObsDialogOpen, setIsObsDialogOpen] = useState(false);
    const [obsMessage, setObsMessage] = useState("");
    const [obsPatient, setObsPatient] = useState<ConsultationItem | null>(null);

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

    useEffect(() => {
        if (activeTab === "todos" && allPatients.length === 0) {
            async function loadAll() {
                setIsLoadingAll(true);
                try {
                    const data = await getConsultations();
                    setAllPatients(data);
                } catch (error) {
                    toast.error("Erro ao carregar todas as consultas");
                } finally {
                    setIsLoadingAll(false);
                }
            }
            loadAll();
        }
    }, [activeTab]);

    // Actions
    const handleSelectPatient = (patient: any) => {
        setNewPatientName(patient.name);
        setNewPatientPhone(formatPhone(patient.phone || ""));
        setNewPatientInsurance(patient.insurance || "");
        setShowSuggestions(false);
    };

    const handleEditPatient = (patient: ConsultationItem) => {
        setEditingPatientId(patient.id);
        setNewPatientName(patient.patientName);
        setNewPatientPhone(patient.phone || "");
        setNewPatientTime(patient.time);
        setNewPatientInsurance(patient.insurance || "");
    };

    const handleCancelEdit = () => {
        setEditingPatientId(null);
        setNewPatientName("");
        setNewPatientPhone("");
        setNewPatientTime("");
        setNewPatientInsurance("");
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
                insurance: newPatientInsurance,
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
                    insurance: newPatientInsurance,
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
                insurance: newPatientInsurance
            });

            setPatients([...patients, newItem as ConsultationItem]);
            setNewPatientName("");
            setNewPatientPhone("");
            setNewPatientTime("");
            setNewPatientInsurance("");
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

    const handleArchivePatient = async (id: string) => {
        try {
            const updated = await updateConsultation(id, { isArchived: true });

            // Immediately update the current patients list
            setPatients(patients.map(p => p.id === id ? { ...p, isArchived: true } : p));

            // Add the newly archived patient to the allPatients array directly if it's already loaded
            if (activeTab === "todos" || allPatients.length > 0) {
                setAllPatients(prev => {
                    const exists = prev.find(p => p.id === id);
                    if (exists) {
                        return prev.map(p => p.id === id ? updated as ConsultationItem : p);
                    }
                    return [...prev, updated as ConsultationItem];
                });
            }
            toast.success("Consulta arquivada");
        } catch (error) {
            toast.error("Erro ao arquivar consulta");
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

    const exportToPDF = async () => {
        setExportType("pdf");
        // Let React render the table without the hospital column and with the logo
        await new Promise((resolve) => setTimeout(resolve, 300));

        const tableElement = document.getElementById("history-table-container");
        if (!tableElement) {
            setExportType(null);
            return;
        }

        // Temporarily adjust styles for better PDF rendering
        const originalStyle = tableElement.style.cssText;
        const tableWrapper = tableElement.querySelector("table")?.parentElement;
        const originalWrapperStyle = tableWrapper?.style.cssText;

        // Force basic background and foreground to bypass oklch parsing error in html2canvas
        tableElement.style.width = "1000px";
        tableElement.style.maxWidth = "none";
        tableElement.style.backgroundColor = "#ffffff";
        tableElement.style.color = "#000000";

        if (tableWrapper) {
            // Remove overflow to hide horizontal scrollbar in image export
            tableWrapper.style.overflow = "visible";
        }

        // Let it render briefly before capture
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            const imgData = await toPng(tableElement, {
                pixelRatio: 2,
                backgroundColor: "#ffffff",
                style: { width: "1000px" },
            });

            // A4 page dimensions in mm
            const pdfWidth = 210;
            const pdfHeight = 297;
            const pdf = new jsPDF("p", "mm", "a4");

            // Calculate scaled dimensions fitting to page width
            const imgProps = (pdf as any).getImageProperties(imgData);
            const pdfImgWidth = pdfWidth;
            const pdfImgHeight = (imgProps.height * pdfWidth) / imgProps.width;

            // Load Logo
            const logoImg = new Image();
            logoImg.src = "/logo.png";
            await new Promise((resolve) => {
                logoImg.onload = resolve;
                logoImg.onerror = resolve; // proceed even on error
            });

            const logoAspect = logoImg.width / (logoImg.height || 1);
            const logoBoxHeight = 28; // mm
            const logoBoxWidth = logoBoxHeight * logoAspect;
            const logoMarginY = 10;
            const logoMarginX = (pdfWidth - logoBoxWidth) / 2;

            const contentStartY = logoBoxHeight + logoMarginY * 2;
            const tablePageHeight = pdfHeight - contentStartY;

            let heightLeft = pdfImgHeight;
            let position = contentStartY;

            // Page 1
            pdf.addImage(imgData, "PNG", 0, position, pdfImgWidth, pdfImgHeight);
            pdf.addImage(logoImg, "PNG", logoMarginX, logoMarginY, logoBoxWidth, logoBoxHeight);
            heightLeft -= tablePageHeight;

            while (heightLeft > 0) {
                position -= tablePageHeight;
                pdf.addPage();

                // Draw table image shifted
                pdf.addImage(imgData, "PNG", 0, position, pdfImgWidth, pdfImgHeight);

                // Blank out the header overlap
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pdfWidth, contentStartY, "F");

                // Draw logo
                pdf.addImage(logoImg, "PNG", logoMarginX, logoMarginY, logoBoxWidth, logoBoxHeight);

                heightLeft -= tablePageHeight;
            }

            pdf.save(`historico-consultas-${format(new Date(), "dd-MM-yyyy")}.pdf`);
            toast.success("PDF Exportado com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao gerar PDF.");
        } finally {
            // Restore original styles
            tableElement.style.cssText = originalStyle;
            if (tableWrapper && originalWrapperStyle !== undefined) {
                tableWrapper.style.cssText = originalWrapperStyle;
            }
            setExportType(null);
        }
    };

    const exportToJPEG = async () => {
        setExportType("jpeg");
        // Let React render the table without the hospital column and with the logo
        await new Promise((resolve) => setTimeout(resolve, 300));

        const tableElement = document.getElementById("history-table-container");
        if (!tableElement) {
            setExportType(null);
            return;
        }

        const originalStyle = tableElement.style.cssText;
        const tableWrapper = tableElement.querySelector("table")?.parentElement;
        const originalWrapperStyle = tableWrapper?.style.cssText;

        tableElement.style.width = "1000px";
        tableElement.style.maxWidth = "none";
        tableElement.style.backgroundColor = "#ffffff"; // Solid background for JPG
        tableElement.style.color = "#000000";

        if (tableWrapper) {
            // Remove overflow to hide horizontal scrollbar in image export
            tableWrapper.style.overflow = "visible";
        }

        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
            const imgData = await toJpeg(tableElement, {
                pixelRatio: 2,
                quality: 0.9,
                backgroundColor: "#ffffff",
                style: { width: "1000px" },
            });

            const link = document.createElement("a");
            link.href = imgData;
            link.download = `historico-consultas-${format(new Date(), "dd-MM-yyyy")}.jpg`;
            link.click();
            toast.success("Imagem exportada com sucesso!");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao exportar imagem.");
        } finally {
            tableElement.style.cssText = originalStyle;
            if (tableWrapper && originalWrapperStyle !== undefined) {
                tableWrapper.style.cssText = originalWrapperStyle;
            }
            setExportType(null);
        }
    };

    const formatHistoryDate = (dateString?: string) => {
        if (!dateString) return "-";

        let datePart = dateString;
        if (dateString.includes('T')) {
            datePart = dateString.split('T')[0];
        }

        if (!datePart.includes('-')) {
            try { return format(new Date(dateString), "dd/MM/yyyy"); }
            catch { return dateString; }
        }

        const [y, m, d] = datePart.split('-').map(Number);
        return format(new Date(y, m - 1, d), "dd/MM/yyyy");
    };

    return (
        <div className="  mx-auto p-6 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary">Agendamento de Consultas</h1>
                <p className="text-muted-foreground">Gerencie a lista de consultas e confirmações via WhatsApp.</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full flex flex-col items-center">
                <TabsList className="grid w-full max-w-[600px] grid-cols-2 rounded-xl p-1 bg-slate-100/50 border border-slate-200 shadow-sm h-12">
                    <TabsTrigger value="agendamento" className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">Agendamento</TabsTrigger>
                    <TabsTrigger value="todos" className="rounded-lg text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md">Todos os Agendamentos</TabsTrigger>
                </TabsList>

                <TabsContent value="agendamento" className="space-y-8 w-full">
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
                                    {(filterDoctorIds.length > 0 || filterHospitalIds.length > 0 || filterDate || filterStatuses.length > 0) && (
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
                            <div className="grid gap-4 md:grid-cols-[1fr_150px_150px_100px_auto] items-end border p-4 rounded-lg bg-muted/20">
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
                                    <label className="text-sm font-medium">Convênio</label>
                                    <div className="flex items-center">
                                        <FileText className="w-4 h-4 mr-2 text-muted-foreground" />
                                        <Input
                                            placeholder="Ex: Unimed"
                                            value={newPatientInsurance}
                                            onChange={(e) => setNewPatientInsurance(e.target.value)}
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
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{hospitals.find(h => h.id === patient.hospitalId)?.name || "-"}</span>
                                                                <span className="text-xs text-muted-foreground">{doctors.find(d => d.id === patient.doctorId)?.name || "-"}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Select
                                                                value={
                                                                    (patient.status?.trim().toLowerCase() === 'confirmada' || patient.status?.trim().toLowerCase() === 'confirmado') ? 'Confirmada' :
                                                                        (patient.status?.trim().toLowerCase() === 'cancelada' || patient.status?.trim().toLowerCase() === 'cancelado') ? 'Cancelada' :
                                                                            patient.status?.trim().toLowerCase() === 'aguardando' ? 'Aguardando' :
                                                                                patient.status?.trim().toLowerCase() === 'encaixe' ? 'Encaixe' :
                                                                                    (patient.status?.trim().toLowerCase() === 'contato invalido' || patient.status?.trim().toLowerCase() === 'contato inválido') ? 'Contato Invalido' :
                                                                                        (patient.status?.trim().toLowerCase() === 'sem confirmação' || patient.status?.trim().toLowerCase() === 'sem confirmacao') ? 'Sem Confirmação' :
                                                                                            'Pendente'
                                                                }
                                                                onValueChange={(val) => handleStatusChange(patient.id, val)}
                                                            >
                                                                <SelectTrigger
                                                                    className={`h-9 w-full text-[10px] font-bold uppercase transition-all border ${(patient.status?.trim().toLowerCase() === 'confirmada' || patient.status?.trim().toLowerCase() === 'confirmado') ? 'bg-green-50 border-green-200 text-green-700' :
                                                                        (patient.status?.trim().toLowerCase() === 'cancelada' || patient.status?.trim().toLowerCase() === 'cancelado') ? 'bg-red-50 border-red-200 text-red-700' :
                                                                            patient.status?.trim().toLowerCase() === 'aguardando' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                                                                                patient.status?.trim().toLowerCase() === 'encaixe' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                                                                                    (patient.status?.trim().toLowerCase() === 'contato invalido' || patient.status?.trim().toLowerCase() === 'contato inválido') ? 'bg-gray-100 border-gray-300 text-gray-700' :
                                                                                        (patient.status?.trim().toLowerCase() === 'sem confirmação' || patient.status?.trim().toLowerCase() === 'sem confirmacao') ? 'bg-orange-50 border-orange-200 text-orange-700' :
                                                                                            'bg-yellow-50 border-yellow-200 text-yellow-700'
                                                                        } hover:opacity-80`}
                                                                >
                                                                    <SelectValue placeholder="Status" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="Pendente">Pendente</SelectItem>
                                                                    <SelectItem value="Aguardando">Aguardando</SelectItem>
                                                                    <SelectItem value="Confirmada">Confirmada</SelectItem>
                                                                    <SelectItem value="Sem Confirmação">Sem Confirmação</SelectItem>
                                                                    <SelectItem value="Encaixe">Encaixe</SelectItem>
                                                                    <SelectItem value="Cancelada">Cancelada</SelectItem>
                                                                    <SelectItem value="Contato Invalido">Contato Inválido</SelectItem>
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
                                                            >
                                                                <MessageCircle className="w-4 h-4 mr-2" />
                                                                {patient.whatsappSent ? "Reenviar" : whatsappErrors[patient.id] ? "Erro" : "WhatsApp"}
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="text-amber-600 border-slate-200 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={() => handleArchivePatient(patient.id)}
                                                                title="Arquivar"
                                                            >
                                                                <Archive className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className={`relative text-slate-600 border-slate-200 hover:bg-slate-50 ${patient.observations ? "bg-slate-100 font-semibold" : ""}`}
                                                                onClick={() => {
                                                                    setObsPatient(patient);
                                                                    setObsMessage(patient.observations || "");
                                                                    setIsObsDialogOpen(true);
                                                                }}
                                                            >
                                                                <FileText className="w-4 h-4" />
                                                                {patient.observations && (
                                                                    <span className="absolute -top-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">
                                                                        !
                                                                    </span>
                                                                )}
                                                            </Button>

                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" className="h-8 w-8 p-0 border border-slate-200 hover:bg-slate-50">
                                                                        <span className="sr-only">Abrir menu</span>
                                                                        <MoreHorizontal className="h-4 w-4 text-slate-600" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => handleEditPatient(patient)} className="cursor-pointer text-blue-600 focus:text-blue-700">
                                                                        <Pencil className="w-4 h-4 mr-2" />
                                                                        Editar
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => handleDeletePatient(patient.id)} className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive">
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Excluir
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
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
                    <Dialog open={isObsDialogOpen} onOpenChange={setIsObsDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Observações</DialogTitle>
                                <DialogDescription>
                                    {obsPatient?.patientName ? `Observações para ${obsPatient.patientName}` : "Adicione notas da consulta"}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-2">
                                <Textarea
                                    value={obsMessage}
                                    onChange={(e) => setObsMessage(e.target.value)}
                                    rows={8}
                                    className="resize-none"
                                    placeholder="Digite as observações..."
                                />
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsObsDialogOpen(false)}>Cancelar</Button>
                                <Button onClick={() => {
                                    if (obsPatient) {
                                        handleObservationChange(obsPatient.id, obsMessage);
                                        setIsObsDialogOpen(false);
                                    }
                                }}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
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
                                            setFilterDoctorIds([]);
                                            setFilterHospitalIds([]);
                                            setFilterDate("");
                                            setFilterStatuses([]);
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
                                    <Label>Médicos</Label>
                                    <MultiSelectFilter
                                        title="Profissionais"
                                        options={doctors.map(d => ({ value: d.id, label: d.name }))}
                                        selectedValues={filterDoctorIds}
                                        onSelectionChange={setFilterDoctorIds}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Hospitais / Clínicas</Label>
                                    <MultiSelectFilter
                                        title="Hospitais"
                                        options={hospitals.map(h => ({ value: h.id, label: h.name }))}
                                        selectedValues={filterHospitalIds}
                                        onSelectionChange={setFilterHospitalIds}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Data da Consulta</Label>
                                    <Input
                                        type="date"
                                        value={filterDate}
                                        onChange={(e) => setFilterDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Status</Label>
                                    <MultiSelectFilter
                                        title="Status"
                                        options={[
                                            { value: "pendente", label: "Pendente" },
                                            { value: "confirmada", label: "Confirmado(a)" },
                                            { value: "cancelada", label: "Cancelado(a)" },
                                            { value: "aguardando", label: "Aguardando" },
                                            { value: "encaixe", label: "Encaixe" },
                                            { value: "contato invalido", label: "Contato Inválido" },
                                            { value: "sem confirmacao", label: "Sem Confirmação" }
                                        ]}
                                        selectedValues={filterStatuses}
                                        onSelectionChange={setFilterStatuses}
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

                </TabsContent>

                <TabsContent value="todos" className="space-y-6 w-full">
                    <Card>
                        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <CardTitle>Histórico Completo de Consultas</CardTitle>
                                <CardDescription>Visualize todas as consultas já registradas no sistema.</CardDescription>
                            </div>
                            <div className="flex gap-2 items-center w-full sm:w-auto">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" className="hidden sm:flex">
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={exportToPDF} className="cursor-pointer">
                                            <FileJson className="w-4 h-4 mr-2" />
                                            Em PDF
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={exportToJPEG} className="cursor-pointer">
                                            <ImageIcon className="w-4 h-4 mr-2" />
                                            Em Imagem (JPEG)
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <div className="relative flex-1 sm:w-[250px]">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filtrar por paciente..."
                                        value={historyFilterPatientName}
                                        onChange={(e) => setHistoryFilterPatientName(e.target.value)}
                                        className="pl-8"
                                    />
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setTempHistoryFilterDoctorId(historyFilterDoctorId);
                                        setTempHistoryFilterHospitalId(historyFilterHospitalId);
                                        setTempHistoryFilterDate(historyFilterDate);
                                        setTempHistoryFilterInsurance(historyFilterInsurance);
                                        setIsHistoryFilterSidebarOpen(true);
                                    }}
                                    className="relative whitespace-nowrap"
                                >
                                    <Filter className="w-4 h-4 mr-2" />
                                    Filtros
                                    {(historyFilterDoctorId !== "all" || historyFilterHospitalId !== "all" || historyFilterDate || historyFilterInsurance !== "all") && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border bg-white" id="history-table-container">
                                {exportType === "jpeg" && (
                                    <div className="flex justify-center items-center p-6 bg-white w-full border-b">
                                        <img src="/logo.png" alt="Logo" className="h-[120px] w-auto object-contain" />
                                    </div>
                                )}
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[110px]">Data</TableHead>
                                            <TableHead className="w-[350px]">Paciente</TableHead>
                                            {!exportType && <TableHead className="w-[290px]">Hospital</TableHead>}
                                            {!exportType && <TableHead className="w-[400px]">Observações</TableHead>}
                                            <TableHead className="w-[120px]">Status</TableHead>
                                            {exportType && <TableHead className="w-[400px]">Observações</TableHead>}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {isLoadingAll ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                                                    <p className="mt-2 text-sm text-muted-foreground">Carregando todas as consultas...</p>
                                                </TableCell>
                                            </TableRow>
                                        ) : filteredHistoryPatients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    Nenhuma consulta encontrada no histórico.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredHistoryPatients
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map((patient) => (
                                                    <TableRow key={patient.id}>
                                                        <TableCell className="font-medium">
                                                            <div className="flex flex-col">
                                                                <span>{formatHistoryDate(patient.date)}</span>
                                                                <span className="text-xs text-muted-foreground">{patient.time}</span>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex flex-col">
                                                                <span>{patient.patientName}</span>
                                                                <span className="text-xs text-muted-foreground">{patient.insurance || "-"}</span>
                                                            </div>
                                                        </TableCell>
                                                        {!exportType && (
                                                            <TableCell>
                                                                <div className="flex flex-col">
                                                                    <span>{hospitals.find(h => h.id === patient.hospitalId)?.name || "-"}</span>
                                                                    <span className="text-xs text-muted-foreground">{doctors.find(d => d.id === patient.doctorId)?.name || "-"}</span>
                                                                </div>
                                                            </TableCell>
                                                        )}
                                                        {!exportType && (
                                                            <TableCell className="w-[400px] whitespace-pre-wrap break-words" title={patient.observations || ""}>
                                                                {patient.observations || "-"}
                                                            </TableCell>
                                                        )}
                                                        <TableCell>
                                                            <Badge variant="outline" className={`w-[130px] justify-center text-center ${(patient.status?.trim().toLowerCase() === 'confirmada' || patient.status?.trim().toLowerCase() === 'confirmado') ? 'bg-green-50 text-green-700 border-green-200' :
                                                                (patient.status?.trim().toLowerCase() === 'cancelada' || patient.status?.trim().toLowerCase() === 'cancelado') ? 'bg-red-50 text-red-700 border-red-200' :
                                                                    patient.status?.trim().toLowerCase() === 'aguardando' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                                        patient.status?.trim().toLowerCase() === 'encaixe' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                                            (patient.status?.trim().toLowerCase() === 'contato invalido' || patient.status?.trim().toLowerCase() === 'contato inválido') ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                                                                (patient.status?.trim().toLowerCase() === 'sem confirmação' || patient.status?.trim().toLowerCase() === 'sem confirmacao') ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                                                    'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                }`}>
                                                                {patient.status || 'Pendente'}
                                                            </Badge>
                                                        </TableCell>
                                                        {exportType && (
                                                            <TableCell className="w-[400px] whitespace-pre-wrap break-words" title={patient.observations || ""}>
                                                                {patient.observations || "-"}
                                                            </TableCell>
                                                        )}
                                                    </TableRow>
                                                ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            <Sheet open={isHistoryFilterSidebarOpen} onOpenChange={setIsHistoryFilterSidebarOpen}>
                <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col h-full">
                    <SheetHeader>
                        <div className="flex items-center justify-between">
                            <SheetTitle>Filtros</SheetTitle>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsHistoryFilterSidebarOpen(false)}
                                className="h-8 w-8 p-0"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <SheetDescription>
                            Refine a lista do histórico por médico, hospital, data ou convênio.
                        </SheetDescription>
                    </SheetHeader>

                    <div className="py-6 space-y-6 flex-1 overflow-y-auto">
                        <div className="space-y-2">
                            <Label>Médico</Label>
                            <Select value={tempHistoryFilterDoctorId} onValueChange={setTempHistoryFilterDoctorId}>
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
                            <Select value={tempHistoryFilterHospitalId} onValueChange={setTempHistoryFilterHospitalId}>
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
                                value={tempHistoryFilterDate}
                                onChange={(e) => setTempHistoryFilterDate(e.target.value)}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Convênio</Label>
                            <Select value={tempHistoryFilterInsurance} onValueChange={setTempHistoryFilterInsurance}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos os Convênios" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Todos os Convênios</SelectItem>
                                    {allInsurances.map((insurance, index) => (
                                        <SelectItem key={index} value={insurance}>{insurance}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <SheetFooter className="mt-auto mb-4 flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            className="w-full sm:w-1/2"
                            onClick={() => {
                                setTempHistoryFilterDoctorId("all");
                                setTempHistoryFilterHospitalId("all");
                                setTempHistoryFilterDate("");
                                setTempHistoryFilterInsurance("all");
                                setHistoryFilterDoctorId("all");
                                setHistoryFilterHospitalId("all");
                                setHistoryFilterDate("");
                                setHistoryFilterInsurance("all");
                            }}
                        >
                            Limpar Filtros
                        </Button>
                        <Button
                            className="w-full sm:w-1/2"
                            onClick={() => {
                                setHistoryFilterDoctorId(tempHistoryFilterDoctorId);
                                setHistoryFilterHospitalId(tempHistoryFilterHospitalId);
                                setHistoryFilterDate(tempHistoryFilterDate);
                                setHistoryFilterInsurance(tempHistoryFilterInsurance);
                                setIsHistoryFilterSidebarOpen(false);
                            }}
                        >
                            Aplicar Filtros
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div >
    );
}
