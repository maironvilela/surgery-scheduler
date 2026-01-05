
"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Check, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

const HOSPITALS = [
    "Hospital Albert Einstein",
    "Hospital Sírio-Libanês",
    "Hospital Moinhos de Vento",
    "Hospital Santa Catarina",
    "Hospital Oswaldo Cruz"
];

export function DoctorFilter() {
    const [selectedHospitals, setSelectedHospitals] = useState<string[]>([]);
    const [isHospitalsOpen, setIsHospitalsOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Filtering doctors...", { selectedHospitals });
    }

    const toggleHospital = (hospital: string) => {
        setSelectedHospitals(prev =>
            prev.includes(hospital)
                ? prev.filter(h => h !== hospital)
                : [...prev, hospital]
        );
    }

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filtrar Médicos</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input id="name" placeholder="Nome do médico" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="specialty">Especialidade</Label>
                        <Input id="specialty" placeholder="Ex: Cardiologia" />
                    </div>

                    <div className="space-y-2">
                        <Label>Hospitais</Label>
                        <div className="border rounded-md">
                            <button
                                type="button"
                                onClick={() => setIsHospitalsOpen(!isHospitalsOpen)}
                                className="flex items-center justify-between w-full p-3 text-sm hover:bg-slate-50"
                            >
                                <span className="text-slate-600">
                                    {selectedHospitals.length === 0
                                        ? "Selecione os hospitais"
                                        : `${selectedHospitals.length} selecionado(s)`}
                                </span>
                                {isHospitalsOpen ? (
                                    <ChevronUp className="h-4 w-4 text-slate-400" />
                                ) : (
                                    <ChevronDown className="h-4 w-4 text-slate-400" />
                                )}
                            </button>

                            {isHospitalsOpen && (
                                <div className="p-3 border-t bg-slate-50/50 space-y-2 max-h-[200px] overflow-y-auto">
                                    {HOSPITALS.map((hospital) => {
                                        const isSelected = selectedHospitals.includes(hospital);
                                        return (
                                            <div
                                                key={hospital}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-slate-100 p-1.5 rounded"
                                                onClick={() => toggleHospital(hospital)}
                                            >
                                                <div className={cn(
                                                    "h-4 w-4 border rounded flex items-center justify-center transition-colors",
                                                    isSelected ? "bg-primary border-primary text-primary-foreground" : "border-slate-300 bg-white"
                                                )}>
                                                    {isSelected && <Check className="h-3 w-3" />}
                                                </div>
                                                <span className="text-sm text-slate-700">{hospital}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <Button type="submit" className="flex-1">Aplicar</Button>
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setSelectedHospitals([])}
                        >
                            Limpar
                        </Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}

