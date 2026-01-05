"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Note: Basic inputs used for simplicity.

export interface FilterState {
    name: string;
    doctor: string;
    phone: string;
    insurance: string;
}

interface PatientFilterProps {
    onFilter: (filters: FilterState) => void;
    currentFilters: FilterState;
}

export function PatientFilter({ onFilter, currentFilters }: PatientFilterProps) {
    const [filters, setFilters] = useState<FilterState>(currentFilters);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onFilter(filters);
    };

    const handleClear = () => {
        const emptyFilters = { name: "", doctor: "", phone: "", insurance: "" };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
            <div className="space-y-2">
                <Label htmlFor="search-name">Pesquisar por Nome</Label>
                <Input
                    id="search-name"
                    name="name"
                    placeholder="Ex: Maria Silva"
                    value={filters.name}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="search-doctor">Médico</Label>
                <Input
                    id="search-doctor"
                    name="doctor"
                    placeholder="Ex: Dr. Augusto"
                    value={filters.doctor}
                    onChange={handleChange}
                />
                {/* Using Input for doctor name search for simplicity/flexibility */}
            </div>

            <div className="space-y-2">
                <Label htmlFor="search-phone">Telefone de Contato</Label>
                <Input
                    id="search-phone"
                    name="phone"
                    placeholder="Ex: (11) 99999..."
                    value={filters.phone}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="search-insurance">Convênio</Label>
                <Input
                    id="search-insurance"
                    name="insurance"
                    placeholder="Ex: Unimed"
                    value={filters.insurance}
                    onChange={handleChange}
                />
            </div>

            <div className="flex flex-col gap-2 pt-4">
                <Button type="submit" className="w-full">
                    Aplicar Filtros
                </Button>
                <Button type="button" variant="outline" className="w-full" onClick={handleClear}>
                    Limpar Filtros
                </Button>
            </div>
        </form>
    );
}
