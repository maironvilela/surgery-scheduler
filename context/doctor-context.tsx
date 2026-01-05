"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Doctor } from "@/types";
import { MOCK_DOCTORS } from "@/lib/mock-data";

interface DoctorContextType {
    doctors: Doctor[];
    addDoctor: (doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => void;
    updateDoctor: (id: string, doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => void;
    deleteDoctor: (id: string) => void;
    getDoctor: (id: string) => Doctor | undefined;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({ children }: { children: ReactNode }) {
    const [doctors, setDoctors] = useState<Doctor[]>(MOCK_DOCTORS);

    const addDoctor = (data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => {
        const newDoctor: Doctor = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setDoctors((prev) => [newDoctor, ...prev]);
    };

    const updateDoctor = (id: string, data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => {
        setDoctors((prev) =>
            prev.map((d) =>
                d.id === id
                    ? { ...d, ...data, updatedAt: new Date().toISOString() }
                    : d
            )
        );
    };

    const deleteDoctor = (id: string) => {
        setDoctors((prev) => prev.filter((d) => d.id !== id));
    };

    const getDoctor = (id: string) => {
        return doctors.find((d) => d.id === id);
    };

    return (
        <DoctorContext.Provider
            value={{ doctors, addDoctor, updateDoctor, deleteDoctor, getDoctor }}
        >
            {children}
        </DoctorContext.Provider>
    );
}

export function useDoctors() {
    const context = useContext(DoctorContext);
    if (context === undefined) {
        throw new Error("useDoctors must be used within a DoctorProvider");
    }
    return context;
}
