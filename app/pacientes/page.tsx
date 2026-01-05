"use client";

import { useState } from "react";
import { Patient } from "@/types";
import { PatientForm } from "@/components/patients/patient-form";
import { PatientList } from "@/components/patients/patient-list";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { PatientFilter, FilterState } from "@/components/patients/patient-filter";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { usePatients } from "@/context/patient-context";

export default function PacientesPage() {
    const { patients, addPatient } = usePatients();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        name: "",
        doctor: "",
        phone: "",
        insurance: ""
    });

    const filteredPatients = patients.filter(patient => {
        const matchesName = patient.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesPhone = patient.phone.includes(filters.phone);
        const matchesInsurance = patient.insurance.toLowerCase().includes(filters.insurance.toLowerCase());
        return matchesName && matchesPhone && matchesInsurance;
    });

    const handleCreate = (data: Omit<Patient, "id" | "createdAt">) => {
        addPatient(data);
        setIsFormOpen(false);
    };

    const cancelForm = () => {
        setIsFormOpen(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Gerenciar Pacientes</h1>
                    <p className="text-muted-foreground">Cadastre e visualize seus pacientes.</p>
                </div>

                {!isFormOpen && (
                    <div className="flex gap-2">
                        <Sheet>
                            <SheetTrigger>
                                <Button variant="outline" size="icon">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent>
                                <SheetHeader>
                                    <SheetTitle>Filtrar Pacientes</SheetTitle>
                                    <SheetDescription>
                                        Utilize os campos abaixo para refinar a lista de pacientes.
                                    </SheetDescription>
                                </SheetHeader>
                                <PatientFilter
                                    onFilter={setFilters}
                                    currentFilters={filters}
                                />
                            </SheetContent>
                        </Sheet>
                        <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Novo Paciente
                        </Button>
                    </div>
                )}
            </div>

            {isFormOpen ? (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Novo Paciente
                        </h2>
                    </div>
                    <PatientForm
                        onSubmit={handleCreate}
                        onCancel={cancelForm}
                    />
                </div>
            ) : (
                <PatientList
                    patients={filteredPatients}
                />
            )}
        </div>
    );
}
