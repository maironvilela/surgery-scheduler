"use client";

import { useAgenda } from "@/context/agenda-context";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2, Calendar, Clock, User, Stethoscope, Building, MapPin, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { AgendaForm } from "@/components/agenda/agenda-form";
import { Surgery } from "@/types";
import { StatusBadge, StatusType } from "@/components/ui/status-badge";
import { CommentSection } from "@/components/agenda/comment-section";

export default function AppointmentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getSurgery, deleteSurgery, updateSurgery } = useAgenda();
    const id = params.id as string;
    const surgery = getSurgery(id);

    const [isEditing, setIsEditing] = useState(false);

    if (!surgery) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Agendamento não encontrado</h1>
                <Button onClick={() => router.push("/agenda")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja cancelar/excluir este agendamento?")) {
            deleteSurgery(id);
            router.push("/agenda");
        }
    };

    const handleUpdate = (data: Omit<Surgery, "id" | "createdAt">) => {
        updateSurgery(id, data);
        setIsEditing(false);
    };

    const handleAddComment = (content: string) => {
        const newComment = {
            id: Math.random().toString(36).substr(2, 9),
            user: "Usuário Atual", // Mock user
            date: new Date().toISOString(),
            content,
        };

        const updatedComments = [...(surgery.comments || []), newComment];

        // We need to partial update. Since updateSurgery expects Omit<Surgery, "id" | "createdAt">,
        // we can spread the current surgery object.
        updateSurgery(id, {
            ...surgery,
            comments: updatedComments
        });
    };

    if (isEditing) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-primary">Editar Agendamento</h1>
                </div>
                <AgendaForm
                    initialData={surgery}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/agenda")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Editar
                    </Button>
                    <Button variant="destructive" onClick={handleDelete}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info Card */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <CardTitle className="flex items-center gap-2 text-2xl">
                                <Stethoscope className="h-6 w-6 text-primary" />
                                {surgery.procedure}
                            </CardTitle>
                            <StatusBadge status={surgery.status as StatusType} />
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Detalhes do Procedimento</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    <span>{surgery.startTime} - {surgery.endTime}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(surgery.date).toLocaleDateString('pt-BR')}</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Envolvidos</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-foreground">Paciente:</span>
                                    <span>{surgery.patientName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium text-foreground">Médico:</span>
                                    <span>{surgery.doctorName}</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Localização</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Building className="h-4 w-4" />
                                    <span>{surgery.hospitalName}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{surgery.room}</span>
                                </div>
                            </div>
                        </section>

                        {surgery.notes && (
                            <section className="space-y-3">
                                <h3 className="font-semibold text-lg border-b pb-2">Notas</h3>
                                <div className="flex items-start gap-2 text-muted-foreground">
                                    <FileText className="h-4 w-4 mt-1 shrink-0" />
                                    <p>{surgery.notes}</p>
                                </div>
                            </section>
                        )}
                    </CardContent>
                </Card>

                {/* Side Info / Metadata */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 text-sm text-muted-foreground">
                        <div>
                            <span className="font-medium block text-foreground">ID do Sistema</span>
                            <span className="font-mono text-xs">{surgery.id}</span>
                        </div>
                        <div>
                            <span className="font-medium block text-foreground">Data de Criação</span>
                            <span>{new Date(surgery.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </CardContent>
                </Card>

            </div>
            {/* Comments Section */}
            <CommentSection
                comments={surgery.comments}
                onAddComment={handleAddComment}
            />
        </div>
    );
}
