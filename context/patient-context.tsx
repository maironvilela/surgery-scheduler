"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Patient } from "@/types";
import { getPatients, addPatient as serverAddPatient, updatePatient as serverUpdatePatient, deletePatient as serverDeletePatient } from "@/app/actions/patients";
import { toast } from "sonner";

interface PatientContextType {
    patients: Patient[];
    addPatient: (patient: Omit<Patient, "id" | "createdAt">) => Promise<void>;
    updatePatient: (id: string, patient: Omit<Patient, "id" | "createdAt">) => Promise<void>;
    deletePatient: (id: string) => Promise<void>;
    getPatient: (id: string) => Patient | undefined;
    isLoading: boolean;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadPatients() {
            try {
                const data = await getPatients();
                setPatients(data);
            } catch (error) {
                console.error("Failed to load patients:", error);
                toast.error("Erro ao carregar pacientes");
            } finally {
                setIsLoading(false);
            }
        }
        loadPatients();
    }, []);

    const addPatient = async (data: Omit<Patient, "id" | "createdAt">) => {
        try {
            const newPatient = await serverAddPatient(data);
            setPatients((prev) => [newPatient as Patient, ...prev]);
            toast.success("Paciente adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar paciente");
        }
    };

    const updatePatient = async (id: string, data: Omit<Patient, "id" | "createdAt">) => {
        try {
            const updated = await serverUpdatePatient(id, data);
            setPatients((prev) =>
                prev.map((p) => (p.id === id ? { ...updated as Patient } : p))
            );
            toast.success("Paciente atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar paciente");
        }
    };

    const deletePatient = async (id: string) => {
        try {
            await serverDeletePatient(id);
            setPatients((prev) => prev.filter((p) => p.id !== id));
            toast.success("Paciente removido");
        } catch (error) {
            toast.error("Erro ao remover paciente");
        }
    };

    const getPatient = (id: string) => {
        return patients.find((p) => p.id === id);
    };

    return (
        <PatientContext.Provider
            value={{ patients, addPatient, updatePatient, deletePatient, getPatient, isLoading }}
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
