"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleList } from "@/components/agenda/schedule-list";
import { AgendaFilter } from "@/components/agenda/agenda-filter";
import { AgendaForm } from "@/components/agenda/agenda-form";
import { useAgenda } from "@/context/agenda-context";
import { Surgery } from "@/types";

export default function AgendaPage() {
    const { addSurgery } = useAgenda();
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleCreate = (data: Omit<Surgery, "id" | "createdAt">) => {
        addSurgery({ ...data, comments: data.comments || [] });
        setIsFormOpen(false);
    };

    return (
        <div className="space-y-6 container mx-auto p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Agenda Cirúrgica</h2>
                    <p className="text-muted-foreground">
                        Gerencie as cirurgias agendadas.
                    </p>
                </div>

                {!isFormOpen && (
                    <div className="flex items-center gap-3">
                        <AgendaFilter />
                        <Button onClick={() => setIsFormOpen(true)} className="shrink-0">
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Agendamento
                        </Button>
                    </div>
                )}
            </div>

            {isFormOpen ? (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Novo Agendamento</h2>
                    </div>
                    <AgendaForm
                        onSubmit={handleCreate}
                        onCancel={() => setIsFormOpen(false)}
                    />
                </div>
            ) : (
                <ScheduleList />
            )}
        </div>
    );
}
