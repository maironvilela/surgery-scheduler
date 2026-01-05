"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Surgery } from "@/types";
import { MOCK_SURGERIES } from "@/lib/mock-data";

interface AgendaContextType {
    surgeries: Surgery[];
    addSurgery: (surgery: Omit<Surgery, "id" | "createdAt">) => void;
    updateSurgery: (id: string, surgery: Omit<Surgery, "id" | "createdAt">) => void;
    deleteSurgery: (id: string) => void;
    getSurgery: (id: string) => Surgery | undefined;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export function AgendaProvider({ children }: { children: ReactNode }) {
    const [surgeries, setSurgeries] = useState<Surgery[]>(MOCK_SURGERIES);

    const addSurgery = (data: Omit<Surgery, "id" | "createdAt">) => {
        const newSurgery: Surgery = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        setSurgeries((prev) => [...prev, newSurgery]);
    };

    const updateSurgery = (id: string, data: Omit<Surgery, "id" | "createdAt">) => {
        setSurgeries((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...data } : s))
        );
    };

    const deleteSurgery = (id: string) => {
        setSurgeries((prev) => prev.filter((s) => s.id !== id));
    };

    const getSurgery = (id: string) => {
        return surgeries.find((s) => s.id === id);
    };

    return (
        <AgendaContext.Provider
            value={{
                surgeries,
                addSurgery,
                updateSurgery,
                deleteSurgery,
                getSurgery
            }}
        >
            {children}
        </AgendaContext.Provider>
    );
}

export function useAgenda() {
    const context = useContext(AgendaContext);
    if (context === undefined) {
        throw new Error("useAgenda must be used within a AgendaProvider");
    }
    return context;
}
