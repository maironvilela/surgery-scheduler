"use client";

import { useState } from "react";
import { Hospital } from "@/types";
import { HospitalForm } from "@/components/hospitals/hospital-form";
import { HospitalList } from "@/components/hospitals/hospital-list";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { HospitalFilter, FilterState } from "@/components/hospitals/hospital-filter";
import { useHospitals } from "@/context/hospital-context";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function HospitaisPage() {
    const { hospitals, addHospital } = useHospitals();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        name: "",
        city: ""
    });

    const filteredHospitals = hospitals.filter(hospital => {
        const matchesName = hospital.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesCity = hospital.city.toLowerCase().includes(filters.city.toLowerCase());
        return matchesName && matchesCity;
    });

    const handleCreate = (data: Omit<Hospital, "id" | "createdAt">) => {
        addHospital(data);
        setIsFormOpen(false);
    };

    const cancelForm = () => {
        setIsFormOpen(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Gerenciar Hospitais</h1>
                    <p className="text-muted-foreground">Cadastre e visualize os hospitais parceiros.</p>
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
                                    <SheetTitle>Filtrar Hospitais</SheetTitle>
                                    <SheetDescription>
                                        Utilize os campos abaixo para refinar a lista de hospitais.
                                    </SheetDescription>
                                </SheetHeader>
                                <HospitalFilter
                                    onFilter={setFilters}
                                    currentFilters={filters}
                                />
                            </SheetContent>
                        </Sheet>
                        <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" /> Novo Hospital
                        </Button>
                    </div>
                )}
            </div>

            {isFormOpen ? (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Novo Hospital
                        </h2>
                    </div>
                    <HospitalForm
                        onSubmit={handleCreate}
                        onCancel={cancelForm}
                    />
                </div>
            ) : (
                <HospitalList
                    hospitals={filteredHospitals}
                />
            )}
        </div>
    );
}
