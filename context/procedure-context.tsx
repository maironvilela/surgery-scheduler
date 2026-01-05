"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Procedure } from '@/types';
import { MOCK_PROCEDURES } from '@/lib/mock-data';

interface ProcedureContextType {
    procedures: Procedure[];
    addProcedure: (procedure: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProcedure: (id: string, procedure: Partial<Procedure>) => void;
    deleteProcedure: (id: string) => void;
    getProcedure: (id: string) => Procedure | undefined;
}

const ProcedureContext = createContext<ProcedureContextType | undefined>(undefined);

export function ProcedureProvider({ children }: { children: React.ReactNode }) {
    const [procedures, setProcedures] = useState<Procedure[]>(MOCK_PROCEDURES);

    // Persist to localStorage (simplified)
    useEffect(() => {
        const saved = localStorage.getItem('surg-scheduler-procedures-v2');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setProcedures(parsed);
                }
            } catch (e) {
                console.error("Failed to load procedures from local storage", e)
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('surg-scheduler-procedures-v2', JSON.stringify(procedures));
    }, [procedures]);

    const addProcedure = (data: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt'>) => {
        const newProcedure: Procedure = {
            ...data,
            id: crypto.randomUUID(),
            reports: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        setProcedures(prev => [newProcedure, ...prev]);
    };

    const updateProcedure = (id: string, data: Partial<Procedure>) => {
        setProcedures(prev => prev.map(proc =>
            proc.id === id
                ? { ...proc, ...data, updatedAt: new Date().toISOString() }
                : proc
        ));
    };

    const deleteProcedure = (id: string) => {
        setProcedures(prev => prev.filter(proc => proc.id !== id));
    };

    const getProcedure = (id: string) => {
        return procedures.find(proc => proc.id === id);
    };

    return (
        <ProcedureContext.Provider value={{ procedures, addProcedure, updateProcedure, deleteProcedure, getProcedure }}>
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
