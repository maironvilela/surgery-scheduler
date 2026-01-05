"use client";

import { ScheduleCard } from "./schedule-card";
import { useAgenda } from "@/context/agenda-context";
import { CalendarX } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ScheduleList() {
    const { surgeries } = useAgenda(); // Assuming 'surgeries' is the filtered list
    const [visibleCount, setVisibleCount] = useState(6);

    const currentItems = surgeries.slice(0, visibleCount);
    const hasMore = visibleCount < surgeries.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    if (surgeries.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <CalendarX className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum agendamento encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Agendamentos</h2>
                <div className="text-sm text-muted-foreground">
                    Exibindo {currentItems.length} de {surgeries.length} agendamentos
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                {currentItems.map((item) => (
                    <div key={item.id} className="h-full">
                        <ScheduleCard
                            {...item}
                            patient={item.patientName}
                            doctor={item.doctorName}
                            hospital={item.hospitalName}
                        />
                    </div>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={handleLoadMore}>
                        Carregar Mais
                    </Button>
                </div>
            )}
        </div>
    );
}
