"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const appointments = [
    {
        id: 1,
        date: "17/12/2025",
        time: "08:00 - 10:00",
        patient: "Maria Silva",
        procedure: "Colecistectomia",
        doctor: "Dr. Santos",
        status: "Em Andamento",
    },
    {
        id: 2,
        date: "17/12/2025",
        time: "10:30 - 12:00",
        patient: "João Pereira",
        procedure: "Hernioplastia",
        doctor: "Dra. Costa",
        status: "Agendado",
    },
    {
        id: 3,
        date: "17/12/2025",
        time: "13:00 - 14:30",
        patient: "Ana Oliveira",
        procedure: "Rinoplastia",
        doctor: "Dr. Lima",
        status: "Agendado",
    },
    {
        id: 4,
        date: "18/12/2025",
        time: "08:00 - 09:30",
        patient: "Carlos Souza",
        procedure: "Artroscopia",
        doctor: "Dr. Ferreira",
        status: "Agendado",
    },
    {
        id: 5,
        date: "18/12/2025",
        time: "10:00 - 11:30",
        patient: "Lucia Mendes",
        procedure: "Cesariana",
        doctor: "Dra. Rocha",
        status: "Agendado",
    },
    {
        id: 6,
        date: "19/12/2025",
        time: "08:00 - 09:30",
        patient: "Pedro Santos",
        procedure: "Amigdalectomia",
        doctor: "Dr. Silva",
        status: "Agendado",
    },
    {
        id: 7,
        date: "19/12/2025",
        time: "10:00 - 11:30",
        patient: "Fernanda Lima",
        procedure: "Septoplastia",
        doctor: "Dra. Oliveira",
        status: "Aguardando",
    },
];

const ITEMS_PER_PAGE = 5;

export function RecentAppointments() {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(appointments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentAppointments = appointments.slice(startIndex, endIndex);

    const handlePrevious = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNext = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Próximos Agendamentos</CardTitle>
                <CardDescription>
                    Você tem {appointments.length} cirurgias agendadas.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Mobile View: Cards stack */}
                    <div className="grid gap-4 md:hidden">
                        {currentAppointments.map((apt) => (
                            <div
                                key={apt.id}
                                className="flex flex-col space-y-3 rounded-lg border p-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900">{apt.date}</span>
                                        <span className="text-sm text-slate-500">{apt.time}</span>
                                    </div>
                                    <StatusBadge status={apt.status} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{apt.patient}</p>
                                    <p className="text-sm text-slate-500">{apt.procedure}</p>
                                </div>

                            </div>
                        ))}
                    </div>

                    {/* Desktop View: Table similar structure */}
                    <div className="hidden rounded-md border md:block">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500">
                                <tr className="border-b text-left">
                                    <th className="px-4 py-3 font-medium">Data</th>
                                    <th className="px-4 py-3 font-medium">Horário</th>
                                    <th className="px-4 py-3 font-medium">Paciente</th>
                                    <th className="px-4 py-3 font-medium">Procedimento</th>
                                    <th className="px-4 py-3 font-medium">Médico</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentAppointments.map((apt) => (
                                    <tr key={apt.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                        <td className="px-4 py-3 font-medium text-slate-900">
                                            {apt.date}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-700">
                                            {apt.time}
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{apt.patient}</td>
                                        <td className="px-4 py-3 text-slate-600">{apt.procedure}</td>
                                        <td className="px-4 py-3 text-slate-600">{apt.doctor}</td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={apt.status} />
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Link href={`/agenda/${apt.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Detalhes
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Anterior
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                    >
                        Próxima
                        <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
