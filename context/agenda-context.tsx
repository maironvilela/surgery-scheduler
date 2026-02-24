"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Surgery } from "@/types";
import { getSurgeries, addSurgery as serverAddSurgery, updateSurgery as serverUpdateSurgery, deleteSurgery as serverDeleteSurgery, addSurgeryComment as serverAddComment } from "@/app/actions/surgeries";
import { toast } from "sonner";

interface AgendaContextType {
    surgeries: Surgery[];
    addSurgery: (surgery: Omit<Surgery, "id" | "createdAt" | "comments"> & { comments: any[] }) => Promise<void>;
    updateSurgery: (id: string, surgery: Partial<Omit<Surgery, "id" | "createdAt" | "comments">>) => Promise<void>;
    deleteSurgery: (id: string) => Promise<void>;
    getSurgery: (id: string) => Surgery | undefined;
    addComment: (surgeryId: string, comment: { user: string; date: string; content: string }) => Promise<void>;
    isLoading: boolean;
}

const AgendaContext = createContext<AgendaContextType | undefined>(undefined);

export function AgendaProvider({ children }: { children: ReactNode }) {
    const [surgeries, setSurgeries] = useState<Surgery[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadSurgeries() {
            try {
                const data = await getSurgeries();
                setSurgeries(data);
            } catch (error) {
                console.error("Failed to load surgeries:", error);
                toast.error("Erro ao carregar agenda");
            } finally {
                setIsLoading(false);
            }
        }
        loadSurgeries();
    }, []);

    const addSurgery = async (data: Omit<Surgery, "id" | "createdAt" | "comments"> & { comments: any[] }) => {
        try {
            const newSurgery = await serverAddSurgery(data);
            setSurgeries((prev) => [...prev, newSurgery as Surgery]);
            toast.success("Cirurgia agendada");
        } catch (error) {
            toast.error("Erro ao agendar cirurgia");
        }
    };

    const updateSurgery = async (id: string, data: Partial<Omit<Surgery, "id" | "createdAt" | "comments">>) => {
        try {
            const updated = await serverUpdateSurgery(id, data);
            setSurgeries((prev) =>
                prev.map((s) => (s.id === id ? { ...updated as Surgery } : s))
            );
            toast.success("Cirurgia atualizada");
        } catch (error) {
            toast.error("Erro ao atualizar cirurgia");
        }
    };

    const deleteSurgery = async (id: string) => {
        try {
            await serverDeleteSurgery(id);
            setSurgeries((prev) => prev.filter((s) => s.id !== id));
            toast.success("Cirurgia removida");
        } catch (error) {
            toast.error("Erro ao remover cirurgia");
        }
    };

    const addComment = async (surgeryId: string, comment: { user: string; date: string; content: string }) => {
        try {
            const newComment = await serverAddComment(surgeryId, comment);
            setSurgeries(prev => prev.map(s =>
                s.id === surgeryId
                    ? { ...s, comments: [...(s.comments || []), newComment as any] }
                    : s
            ));
            toast.success("Comentário adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar comentário");
        }
    }

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
                getSurgery,
                addComment,
                isLoading
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
