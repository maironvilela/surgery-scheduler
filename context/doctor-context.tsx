"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Doctor } from "@/types";
import { getDoctors, addDoctor as serverAddDoctor, updateDoctor as serverUpdateDoctor, deleteDoctor as serverDeleteDoctor } from "@/app/actions/doctors";
import { toast } from "sonner";

interface DoctorContextType {
    doctors: Doctor[];
    addDoctor: (doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    updateDoctor: (id: string, doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => Promise<void>;
    deleteDoctor: (id: string) => Promise<void>;
    getDoctor: (id: string) => Doctor | undefined;
    isLoading: boolean;
}

const DoctorContext = createContext<DoctorContextType | undefined>(undefined);

export function DoctorProvider({ children }: { children: ReactNode }) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadDoctors() {
            try {
                const data = await getDoctors();
                setDoctors(data);
            } catch (error) {
                console.error("Failed to load doctors:", error);
                toast.error("Erro ao carregar médicos");
            } finally {
                setIsLoading(false);
            }
        }
        loadDoctors();
    }, []);

    const addDoctor = async (data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => {
        try {
            const newDoctor = await serverAddDoctor(data);
            setDoctors((prev) => [newDoctor as Doctor, ...prev]);
            toast.success("Médico adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar médico");
        }
    };

    const updateDoctor = async (id: string, data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => {
        try {
            const updated = await serverUpdateDoctor(id, data);
            setDoctors((prev) =>
                prev.map((d) => (d.id === id ? { ...updated as Doctor } : d))
            );
            toast.success("Médico atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar médico");
        }
    };

    const deleteDoctor = async (id: string) => {
        try {
            await serverDeleteDoctor(id);
            setDoctors((prev) => prev.filter((d) => d.id !== id));
            toast.success("Médico removido");
        } catch (error) {
            toast.error("Erro ao remover médico");
        }
    };

    const getDoctor = (id: string) => {
        return doctors.find((d) => d.id === id);
    };

    return (
        <DoctorContext.Provider
            value={{ doctors, addDoctor, updateDoctor, deleteDoctor, getDoctor, isLoading }}
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
