"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Eraser } from "lucide-react";

export interface FilterState {
    name: string;
    code: string;
    specialty: string;
}

interface ProcedureFilterProps {
    onFilter: (filters: FilterState) => void;
    currentFilters: FilterState;
}

export function ProcedureFilter({ onFilter, currentFilters }: ProcedureFilterProps) {
    const [filters, setFilters] = useState<FilterState>(currentFilters);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newFilters = { ...filters, [name]: value };
        setFilters(newFilters);
        onFilter(newFilters); // Real-time filtering or add submit button if heavy
    };

    const clearFilters = () => {
        const empty = { name: "", code: "", specialty: "" };
        setFilters(empty);
        onFilter(empty);
    };

    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Procedimento</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Ex: Colecistectomia"
                    value={filters.name}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                    id="code"
                    name="code"
                    placeholder="Ex: 12345"
                    value={filters.code}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="specialty">Especialidade</Label>
                <Input
                    id="specialty"
                    name="specialty"
                    placeholder="Ex: Cirurgia Geral"
                    value={filters.specialty}
                    onChange={handleChange}
                />
            </div>

            <Button variant="ghost" onClick={clearFilters} className="w-full">
                <Eraser className="mr-2 h-4 w-4" />
                Limpar Filtros
            </Button>
        </div>
    );
}
