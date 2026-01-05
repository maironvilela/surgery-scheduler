"use client";

import { useProcedure } from "@/context/procedure-context";
import { ProcedureForm } from "@/components/procedures/procedure-form";
import { ProcedureReports } from "@/components/procedures/procedure-reports";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Procedure } from "@/types";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, ChevronLeft, Activity, Mail, MapPin, Phone, Info, Clock, HeartPulse, FileText } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ProcedureDetailsPage() {
    const params = useParams();
    const id = params.id as string;
    const { getProcedure, updateProcedure, deleteProcedure } = useProcedure();
    const router = useRouter();
    const [procedure, setProcedure] = useState<Procedure | undefined>(undefined);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const found = getProcedure(id);
        if (found) {
            setProcedure(found);
        } else {
            router.push("/procedimentos");
        }
    }, [id, getProcedure, router]);

    const handleSubmit = (data: any) => {
        updateProcedure(id, data);
        setIsEditing(false);
        setProcedure({ ...procedure!, ...data });
    };

    const handleDelete = () => {
        deleteProcedure(id);
        router.push("/procedimentos");
    }

    if (!procedure) return null;

    if (isEditing) {
        return (
            <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => setIsEditing(false)}>
                        <ChevronLeft className="h-4 w-4" /> Voltar
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Editar Procedimento</h1>
                </div>
                <ProcedureForm
                    initialData={procedure}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsEditing(false)}
                />
            </div>
        )
    }

    // Mock dates for system info
    const createdAt = new Date().toLocaleDateString('pt-BR');

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-300">
            {/* Top Navigation & Actions */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4" /> Voltar
                </Button>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o procedimento.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Excluir
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* DOCTOR/PROCEDURE MAIN INFO CARD */}
                <div className="col-span-2 space-y-6">
                    <Card className="overflow-hidden">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Activity className="h-8 w-8 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl">{procedure.name}</CardTitle>
                                    <CardDescription className="text-base mt-1 flex items-center gap-2">
                                        <span className="font-semibold text-primary">{procedure.specialty}</span>
                                        <span>•</span>
                                        <span>Cód: {procedure.code}</span>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <Separator />

                        <CardContent className="pt-6 space-y-8">

                            {/* General Info Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <Info className="h-5 w-5 text-muted-foreground" />
                                    Detalhes Gerais
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tempo Estimado</p>
                                        <p className="text-base flex items-center gap-2 mt-1">
                                            <Clock className="h-4 w-4 text-muted-foreground/70" />
                                            {procedure.estimatedDuration}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Anestesia</p>
                                        <p className="text-base mt-1">{procedure.anesthesiaType || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Tempo de Jejum</p>
                                        <p className="text-base mt-1">{procedure.fastingTime || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Equipe Sugerida</p>
                                        <p className="text-base mt-1">{procedure.teamSize || "-"}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Medical Resources Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <HeartPulse className="h-5 w-5 text-muted-foreground" />
                                    Recursos Médicos
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Necessidade de Sangue</p>
                                        <p className="text-base mt-1">{procedure.bloodRequirement || "Não informado"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Equipamentos</p>
                                        <p className="text-base mt-1 whitespace-pre-wrap">{procedure.equipment || "Nenhum equipamento específico listado."}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Materiais e OPME</p>
                                        <p className="text-base mt-1 whitespace-pre-wrap">{procedure.materials || "Nenhum material específico listado."}</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Post-Op & Docs Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                    Pós-Operatório e Documentação
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Recuperação RPA</p>
                                        <p className="text-base mt-1">{procedure.recoveryTimePACU || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Recuperação UTI</p>
                                        <p className="text-base mt-1">{procedure.recoveryTimeICU || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Internação</p>
                                        <p className="text-base mt-1">{procedure.hospitalizationTime || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-muted-foreground">Consentimento</p>
                                        <p className="text-base mt-1">{procedure.consentForm ? "Obrigatório" : "Não Requerido"}</p>
                                    </div>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>

                {/* SYSTEM INFO SIDEBAR CARD */}
                <div className="col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Informações do Sistema</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">ID do Sistema</p>
                                <p className="text-sm mt-1 font-mono bg-muted p-1 rounded inline-block">{procedure.id}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Data de Cadastro</p>
                                <p className="text-base mt-1">{createdAt}</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Status</p>
                                <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-green-500/15 text-green-700 hover:bg-green-500/25">
                                    Ativo
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <ProcedureReports procedureId={procedure.id} reports={procedure.reports} />
                </div>

            </div>
        </div>
    );
}
