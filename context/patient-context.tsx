"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Patient } from "@/types";
import { MOCK_PATIENTS } from "@/lib/mock-data";

interface PatientContextType {
    patients: Patient[];
    addPatient: (patient: Omit<Patient, "id" | "createdAt">) => void;
    updatePatient: (id: string, patient: Omit<Patient, "id" | "createdAt">) => void;
    deletePatient: (id: string) => void;
    getPatient: (id: string) => Patient | undefined;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
    const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

    const addPatient = (data: Omit<Patient, "id" | "createdAt">) => {
        const newPatient: Patient = {
            ...data,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date().toISOString(),
        };
        setPatients((prev) => [newPatient, ...prev]);
    };

    const updatePatient = (id: string, data: Omit<Patient, "id" | "createdAt">) => {
        setPatients((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...data } : p))
        );
    };

    const deletePatient = (id: string) => {
        setPatients((prev) => prev.filter((p) => p.id !== id));
    };

    const getPatient = (id: string) => {
        return patients.find((p) => p.id === id);
    };

    return (
        <PatientContext.Provider
            value={{ patients, addPatient, updatePatient, deletePatient, getPatient }}
        >
            {children}
        </PatientContext.Provider>
    );
}

export function usePatients() {
    const context = useContext(PatientContext);
    if (context === undefined) {
        throw new Error("usePatients must be used within a PatientProvider");
    }
    return context;
}
