"use client";

import { useHospitals } from "@/context/hospital-context";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit2, Trash2, MapPin, Phone, Mail, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { HospitalForm } from "@/components/hospitals/hospital-form";
import { Hospital } from "@/types";

export default function HospitalDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const { getHospital, deleteHospital, updateHospital } = useHospitals();
    const id = params.id as string;
    const hospital = getHospital(id);

    const [isEditing, setIsEditing] = useState(false);

    if (!hospital) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Hospital não encontrado</h1>
                <Button onClick={() => router.push("/hospitais")}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a lista
                </Button>
            </div>
        );
    }

    const handleDelete = () => {
        if (confirm("Tem certeza que deseja excluir este hospital?")) {
            deleteHospital(id);
            router.push("/hospitais");
        }
    };

    const handleUpdate = (data: Omit<Hospital, "id" | "createdAt">) => {
        updateHospital(id, data);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="container mx-auto p-6 space-y-6">
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-3xl font-bold text-primary">Editar Hospital</h1>
                </div>
                <HospitalForm
                    initialData={hospital}
                    onSubmit={handleUpdate}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.push("/hospitais")}>
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
                            <Building2 className="h-6 w-6 text-primary" />
                            {hospital.name}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Endereço</h3>
                            <div className="space-y-2 text-muted-foreground">
                                <div className="flex items-start gap-2">
                                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                                    <div>
                                        <p>{hospital.street}, {hospital.number} {hospital.complement && `- ${hospital.complement}`}</p>
                                        <p>{hospital.neighborhood}</p>
                                        <p>{hospital.city} - {hospital.state}</p>
                                        <p>CEP: {hospital.cep}</p>
                                    </div>
                                </div>
                                {hospital.referencePoint && (
                                    <div className="mt-2 text-sm bg-muted p-3 rounded-md">
                                        <span className="font-medium">Ponto de referência:</span> {hospital.referencePoint}
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-lg border-b pb-2">Contato</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hospital.contacts
                                    .sort((a, b) => {
                                        if (a.type === b.type) return 0;
                                        return a.type === 'phone' ? -1 : 1;
                                    })
                                    .map((contact) => (
                                        <div key={contact.id} className="flex items-center gap-2 text-muted-foreground">
                                            {contact.type === 'phone' ? <Phone className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                            <div className="flex flex-col">
                                                <span>{contact.value}</span>
                                                {contact.label && <span className="text-xs opacity-70">{contact.label} {contact.isPrimary && "(Principal)"}</span>}
                                            </div>
                                        </div>
                                    ))}
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
                            <span className="font-mono text-xs">{hospital.id}</span>
                        </div>
                        <div>
                            <span className="font-medium block text-foreground">Data de Cadastro</span>
                            <span>{new Date(hospital.createdAt).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
