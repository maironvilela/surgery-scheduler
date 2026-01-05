"use client";

import { useDoctors } from "@/context/doctor-context";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2, Stethoscope, Mail, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { DoctorForm } from "@/components/doctors/doctor-form";
import { Doctor } from "@/types";
import { Badge } from "@/components/ui/badge";

export default function DoctorDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getDoctor, deleteDoctor, updateDoctor } = useDoctors();
    const id = params.id as string;
    const doctor = getDoctor(id);

    const [isEditing, setIsEditing] = useState(false);

    if (!doctor) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Médico não encontrado</h1>
                <Button onClick={() => router.push("/medicos")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este médico?")) {
            deleteDoctor(id);
            router.push("/medicos");
        }
    };

    const handleUpdate = (data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => {
        updateDoctor(id, data);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-primary">Editar Médico</h1>
                </div>
                <DoctorForm
                    initialData={doctor}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/medicos")}>
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
                            <Stethoscope className="h-6 w-6 text-primary" />
                            {doctor.name}
                        </CardTitle>
                        <div className="flex gap-2 pt-2">
                            <Badge variant={doctor.status === 'active' ? 'default' : 'secondary'}>
                                {doctor.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                            <Badge variant="outline">
                                CRM: {doctor.crm}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Especialidade</h3>
                            <div className="text-lg text-muted-foreground">
                                {doctor.specialty}
                            </div>
                        </section>
                        {/* Adding contact/other info placeholders if type had them (type doesn't have phone/email yet for doctor in types/index.ts I recall viewing, but let's check. 
                         Actually I didn't check Doctor type in detail. 
                         In index.ts: id, crm, name, specialty, status, createdAt, updatedAt. 
                         So no phone/email.
                         I will stick to what exists.
                         */}
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
                            <span className="font-mono text-xs">{doctor.id}</span>
                        </div>
                        <div>
                            <span className="font-medium block text-foreground">Data de Cadastro</span>
                            <span>{new Date(doctor.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div>
                            <span className="font-medium block text-foreground">Última Atualização</span>
                            <span>{new Date(doctor.updatedAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
