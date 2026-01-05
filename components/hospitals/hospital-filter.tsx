"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export interface FilterState {
    name: string;
    city: string;
}

interface HospitalFilterProps {
    onFilter: (filters: FilterState) => void;
    currentFilters: FilterState;
}

export function HospitalFilter({ onFilter, currentFilters }: HospitalFilterProps) {
    const [filters, setFilters] = useState(currentFilters);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleApply = () => {
        onFilter(filters);
    };

    const handleClear = () => {
        const emptyFilters = { name: "", city: "" };
        setFilters(emptyFilters);
        onFilter(emptyFilters);
    };

    return (
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">Nome do Hospital</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="Buscar por nome..."
                    value={filters.name}
                    onChange={handleChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                    id="city"
                    name="city"
                    placeholder="Buscar por cidade..."
                    value={filters.city}
                    onChange={handleChange}
                />
            </div>

            <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleApply}>
                    Aplicar Filtros
                </Button>
                <Button variant="outline" onClick={handleClear}>
                    Limpar
                </Button>
            </div>
        </div>
    );
}
