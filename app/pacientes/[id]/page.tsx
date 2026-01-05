"use client";

import { usePatients } from "@/context/patient-context";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2, User, Phone, MapPin, Calendar, Mail, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { PatientForm } from "@/components/patients/patient-form";
import { Patient } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function PatientDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getPatient, deletePatient, updatePatient } = usePatients();
    const id = params.id as string;
    const patient = getPatient(id);

    const [isEditing, setIsEditing] = useState(false);

    if (!patient) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Paciente não encontrado</h1>
                <Button onClick={() => router.push("/pacientes")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este paciente?")) {
            deletePatient(id);
            router.push("/pacientes");
        }
    };

    const handleUpdate = (data: Omit<Patient, "id" | "createdAt">) => {
        updatePatient(id, data);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-primary">Editar Paciente</h1>
                </div>
                <PatientForm
                    initialData={patient}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/pacientes")}>
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
                        <CardTitle className="flex items-center gap-2 text-2xl">
                            <User className="h-6 w-6 text-primary" />
                            {patient.name}
                        </CardTitle>
                        <div className="flex gap-2 pt-2">
                            <Badge variant="outline">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                            </Badge>
                            <Badge variant="outline">
                                {patient.gender === 'male' ? 'Masculino' : patient.gender === 'female' ? 'Feminino' : 'Outro'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Contato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{patient.phone}</span>
                                </div>
                                {patient.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4" />
                                        <span>{patient.email}</span>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Convênio</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>{patient.insurance}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-foreground">Plano:</span>
                                    <span>{patient.plan}</span>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Endereço</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                    <div>
                                        <p>{patient.street}, {patient.number} {patient.complement && `- ${patient.complement}`}</p>
                                        <p>{patient.neighborhood}</p>
                                        <p>{patient.city} - {patient.state}</p>
                                        <p>CEP: {patient.cep}</p>
                                    </div>
                                </div>
                            </div>
                        </section>
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
                            <span className="font-mono text-xs">{patient.id}</span>
                        </div>
                        <div>
                            <span className="font-medium block text-foreground">Data de Cadastro</span>
                            <span>{new Date(patient.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
