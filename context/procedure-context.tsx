"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Procedure } from '@/types';
import { getProcedures, addProcedure as serverAddProcedure, updateProcedure as serverUpdateProcedure, deleteProcedure as serverDeleteProcedure, addProcedureReport as serverAddReport } from '@/app/actions/procedures';
import { toast } from 'sonner';

interface ProcedureContextType {
    procedures: Procedure[];
    addProcedure: (procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt' | 'reports'>) => Promise<void>;
    updateProcedure: (id: string, procedure: Partial<Procedure>) => Promise<void>;
    deleteProcedure: (id: string) => Promise<void>;
    getProcedure: (id: string) => Procedure | undefined;
    addReport: (procedureId: string, report: { user: string; avatar?: string; content: string; date: string }) => Promise<void>;
    isLoading: boolean;
}

const ProcedureContext = createContext<ProcedureContextType | undefined>(undefined);

export function ProcedureProvider({ children }: { children: React.ReactNode }) {
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadProcedures() {
            try {
                const data = await getProcedures();
                setProcedures(data);
            } catch (error) {
                console.error("Failed to load procedures:", error);
                toast.error("Erro ao carregar procedimentos");
            } finally {
                setIsLoading(false);
            }
        }
        loadProcedures();
    }, []);

    const addProcedure = async (data: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt' | 'reports'>) => {
        try {
            const newProcedure = await serverAddProcedure(data);
            setProcedures(prev => [newProcedure as Procedure, ...prev]);
            toast.success("Procedimento adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar procedimento");
        }
    };

    const updateProcedure = async (id: string, data: Partial<Procedure>) => {
        try {
            // Remove reports if present in data as they are updated separately
            const { reports, createdAt, updatedAt, ...rest } = data;
            const updated = await serverUpdateProcedure(id, rest as any);
            setProcedures(prev => prev.map(proc =>
                proc.id === id ? { ...updated as Procedure } : proc
            ));
            toast.success("Procedimento atualizado");
        } catch (error) {
            toast.error("Erro ao atualizar procedimento");
        }
    };

    const deleteProcedure = async (id: string) => {
        try {
            await serverDeleteProcedure(id);
            setProcedures(prev => prev.filter(proc => proc.id !== id));
            toast.success("Procedimento removido");
        } catch (error) {
            toast.error("Erro ao remover procedimento");
        }
    };

    const getProcedure = (id: string) => {
        return procedures.find(proc => proc.id === id);
    };

    const addReport = async (procedureId: string, report: { user: string; avatar?: string; content: string; date: string }) => {
        try {
            const newReport = await serverAddReport(procedureId, report);
            setProcedures(prev => prev.map(p =>
                p.id === procedureId
                    ? { ...p, reports: [...(p.reports || []), newReport as any] }
                    : p
            ));
            toast.success("Relatório adicionado");
        } catch (error) {
            toast.error("Erro ao adicionar relatório");
        }
    };

    return (
        <ProcedureContext.Provider value={{ procedures, addProcedure, updateProcedure, deleteProcedure, getProcedure, addReport, isLoading }}>
            {children}
        </ProcedureContext.Provider>
    );
}

export function useProcedure() {
    const context = useContext(ProcedureContext);
    if (context === undefined) {
        throw new Error('useProcedure must be used within a ProcedureProvider');
    }
    return context;
}
