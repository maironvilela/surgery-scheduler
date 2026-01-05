"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Hospital } from "@/types";
import { MOCK_HOSPITALS } from "@/lib/mock-data";

interface HospitalContextType {
    hospitals: Hospital[];
    addHospital: (hospital: Omit<Hospital, "id" | "createdAt">) => void;
    updateHospital: (id: string, hospital: Omit<Hospital, "id" | "createdAt">) => void;
    deleteHospital: (id: string) => void;
    getHospital: (id: string) => Hospital | undefined;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: ReactNode }) {
    const [hospitals, setHospitals] = useState<Hospital[]>(MOCK_HOSPITALS);

    const addHospital = (data: Omit<Hospital, "id" | "createdAt">) => {
        const newHospital: Hospital = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        setHospitals((prev) => [newHospital, ...prev]);
    };

    const updateHospital = (id: string, data: Omit<Hospital, "id" | "createdAt">) => {
        setHospitals((prev) =>
            prev.map((h) => (h.id === id ? { ...h, ...data } : h))
        );
    };

    const deleteHospital = (id: string) => {
        setHospitals((prev) => prev.filter((h) => h.id !== id));
    };

    const getHospital = (id: string) => {
        return hospitals.find((h) => h.id === id);
    };

    return (
        <HospitalContext.Provider
            value={{ hospitals, addHospital, updateHospital, deleteHospital, getHospital }}
        >
            {children}
        </HospitalContext.Provider>
    );
}

export function useHospitals() {
    const context = useContext(HospitalContext);
    if (context === undefined) {
        throw new Error("useHospitals must be used within a HospitalProvider");
    }
    return context;
}
