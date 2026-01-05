"use client";

import { useState } from "react";
import { Doctor } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Stethoscope } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface DoctorListProps {
    doctors: Doctor[];
    onEdit?: (doctor: Doctor) => void;
    onDelete?: (id: string) => void;
}

export function DoctorList({ doctors }: DoctorListProps) {
    const [visibleCount, setVisibleCount] = useState(6);

    const currentItems = doctors.slice(0, visibleCount);
    const hasMore = visibleCount < doctors.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    if (doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Stethoscope className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum médico encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold">Lista de Médicos</h2>
                <div className="text-sm text-muted-foreground">
                    Exibindo {currentItems.length} de {doctors.length} médicos
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
                {currentItems.map((doctor) => {
                    const initials = doctor.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase();

                    return (
                        <Card key={doctor.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                            <CardContent className="p-0">
                                <div className="p-4 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                                                <AvatarFallback>{initials}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <h3 className="font-semibold text-lg">{doctor.name}</h3>
                                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                                    <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'} className="mr-2">
                                                        {doctor.status === 'active' ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                    CRM: {doctor.crm}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center text-muted-foreground bg-muted/30 p-2 rounded-md">
                                            <Stethoscope className="h-4 w-4 mr-2" />
                                            {doctor.specialty}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t mt-4">
                                        <Link href={`/medicos/${doctor.id}`} className="w-full block">
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
                    );
                })}
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
