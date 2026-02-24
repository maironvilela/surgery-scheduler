"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Hospital } from "@/types";
import { getHospitals, addHospital as serverAddHospital, updateHospital as serverUpdateHospital, deleteHospital as serverDeleteHospital } from "@/app/actions/hospitals";
import { toast } from "sonner";

interface HospitalContextType {
    hospitals: Hospital[];
    addHospital: (hospital: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) => Promise<void>;
    updateHospital: (id: string, hospital: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) => Promise<void>;
    deleteHospital: (id: string) => Promise<void>;
    getHospital: (id: string) => Hospital | undefined;
    isLoading: boolean;
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: ReactNode }) {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadHospitals() {
            try {
                const data = await getHospitals();
                setHospitals(data);
            } catch (error) {
                console.error("Failed to load hospitals:", error);
                toast.error("Erro ao carregar hospitais");
            } finally {
                setIsLoading(false);
            }
        }
        loadHospitals();
    }, []);

    const addHospital = async (data: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) => {
        try {
            const newHospital = await serverAddHospital(data);
            setHospitals((prev) => [newHospital as Hospital, ...prev]);
            toast.success("Hospital adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar hospital");
        }
    };

    const updateHospital = async (id: string, data: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) => {
        try {
            const updated = await serverUpdateHospital(id, data);
            setHospitals((prev) =>
                prev.map((h) => (h.id === id ? { ...updated as Hospital } : h))
            );
            toast.success("Hospital atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar hospital");
        }
    };

    const deleteHospital = async (id: string) => {
        try {
            await serverDeleteHospital(id);
            setHospitals((prev) => prev.filter((h) => h.id !== id));
            toast.success("Hospital removido");
        } catch (error) {
            toast.error("Erro ao remover hospital");
        }
    };

    const getHospital = (id: string) => {
        return hospitals.find((h) => h.id === id);
    };

    return (
        <HospitalContext.Provider
            value={{ hospitals, addHospital, updateHospital, deleteHospital, getHospital, isLoading }}
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
