"use client";

import { useState } from "react";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { User, Phone, MapPin } from "lucide-react";
import Link from "next/link";

interface PatientListProps {
    patients: Patient[];
}

export function PatientList({ patients }: PatientListProps) {
    const [visibleCount, setVisibleCount] = useState(6);

    const currentItems = patients.slice(0, visibleCount);
    const hasMore = visibleCount < patients.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    if (patients.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <User className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum paciente encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Lista de Pacientes</h2>
                <div className="text-sm text-muted-foreground">
                    Exibindo {currentItems.length} de {patients.length} pacientes
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
                {currentItems.map((patient) => (
                    <Card key={patient.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <CardContent className="p-0">
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            {patient.insurance} - {patient.plan}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-muted-foreground bg-muted/30 p-2 rounded-md">
                                        <Phone className="h-4 w-4 mr-2" />
                                        {patient.phone}
                                    </div>
                                    <div className="text-muted-foreground px-2 flex items-center">
                                        <MapPin className="h-3 w-3 mr-2" />
                                        {patient.city} - {patient.state}
                                    </div>
                                </div>

                                <div className="pt-2 border-t mt-4">
                                    <Link href={`/pacientes/${patient.id}`} className="w-full block">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
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
