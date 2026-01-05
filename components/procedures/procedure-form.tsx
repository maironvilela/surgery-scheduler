"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have Textarea, if not will use Input or create one
import { Procedure } from "@/types";
import { useRouter } from "next/navigation";

// Simplified Textarea component if not exists (usually in shadcn/ui but checking standard components)
// I will use standard standard textarea with tailwind if component not present in my knowledge context, but I assume it exists or I can use standard HTML.
// Actually, let's stick to standard components I know are available or easy to style.

interface ProcedureFormProps {
    initialData?: Procedure;
    onSubmit: (data: Omit<Procedure, "id" | "createdAt" | "updatedAt">) => void;
    isLoading?: boolean;
    onCancel?: () => void;
}

export function ProcedureForm({ initialData, onSubmit, isLoading, onCancel }: ProcedureFormProps) {
    const router = useRouter();
    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Omit<Procedure, "id" | "createdAt" | "updatedAt">>({
        defaultValues: {
            code: "",
            name: "",
            specialty: "",
            fastingTime: "",
            estimatedDuration: "",
            anesthesiaType: "",
            equipment: "",
            materials: "",
            bloodRequirement: "",
            teamSize: "",
            recoveryTimePACU: "",
            recoveryTimeICU: "",
            hospitalizationTime: "",
            homeRecoveryTime: "",
            suggestedCertificateTime: "",
            consentForm: false,
            ...initialData
        }
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Tabs defaultValue="identification" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
                    <TabsTrigger value="identification">Identificação</TabsTrigger>
                    <TabsTrigger value="preop">Pré-Op</TabsTrigger>
                    <TabsTrigger value="operation">Operação</TabsTrigger>
                    <TabsTrigger value="postop">Pós-Op</TabsTrigger>
                    <TabsTrigger value="docs">Documentos</TabsTrigger>
                </TabsList>

                {/* IDENTIFICATION */}
                <TabsContent value="identification">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identificação do Procedimento</CardTitle>
                            <CardDescription>Informações básicas e classificação.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Código do Procedimento</Label>
                                    <Input id="code" {...register("code", { required: "Obrigatório" })} placeholder="Ex: 30201012" />
                                    {errors.code && <span className="text-sm text-red-500">{errors.code.message}</span>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="specialty">Especialidade Médica</Label>
                                    <Input id="specialty" {...register("specialty", { required: "Obrigatório" })} placeholder="Ex: Cirurgia Geral" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Nome do Procedimento</Label>
                                <Input id="name" {...register("name", { required: "Obrigatório" })} placeholder="Ex: Apendicectomia" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PRE-OP */}
                <TabsContent value="preop">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pré-Operatório</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fastingTime">Tempo de Jejum</Label>
                                <Input id="fastingTime" {...register("fastingTime")} placeholder="Ex: 8 horas absoluto" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* OPERATION */}
                <TabsContent value="operation">
                    <Card>
                        <CardHeader>
                            <CardTitle>Operação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="estimatedDuration">Tempo Estimado</Label>
                                    <Input id="estimatedDuration" {...register("estimatedDuration")} placeholder="Ex: 60 min" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="anesthesiaType">Tipo de Anestesia</Label>
                                    <Input id="anesthesiaType" {...register("anesthesiaType")} placeholder="Geral, Local, Raqui..." />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="teamSize">Equipe Mínima Sugerida</Label>
                                <Input id="teamSize" {...register("teamSize")} placeholder="Ex: 1 Cirurgião, 1 Auxiliar..." />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="bloodRequirement">Necessidade de Sangue</Label>
                                <Input id="bloodRequirement" {...register("bloodRequirement")} placeholder="Ex: Não ou Reserva 2CH" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="equipment">Equipamentos Necessários</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    id="equipment"
                                    {...register("equipment")}
                                    placeholder="Ex: Torre de vídeo..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="materials">Materiais e OPME</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    id="materials"
                                    {...register("materials")}
                                    placeholder="Listar materiais específicos..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* POST-OP */}
                <TabsContent value="postop">
                    <Card>
                        <CardHeader>
                            <CardTitle>Pós-Operatório</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="recoveryTimePACU">Recuperação RPA</Label>
                                    <Input id="recoveryTimePACU" {...register("recoveryTimePACU")} placeholder="Ex: 1 hora" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="recoveryTimeICU">Recuperação UTI</Label>
                                    <Input id="recoveryTimeICU" {...register("recoveryTimeICU")} placeholder="Ex: 24 horas (se necessário)" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hospitalizationTime">Tempo de Internação</Label>
                                    <Input id="hospitalizationTime" {...register("hospitalizationTime")} placeholder="Ex: 2 dias" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="homeRecoveryTime">Recuperação Domiciliar</Label>
                                    <Input id="homeRecoveryTime" {...register("homeRecoveryTime")} placeholder="Ex: 15 dias" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="suggestedCertificateTime">Tempo de Atestado Sugerido</Label>
                                <Input id="suggestedCertificateTime" {...register("suggestedCertificateTime")} placeholder="Ex: 15 dias" />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* DOCS */}
                <TabsContent value="docs">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documentação</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="consentForm"
                                    onCheckedChange={(checked) => setValue("consentForm", checked as boolean)}
                                    defaultChecked={initialData?.consentForm}
                                />
                                <Label htmlFor="consentForm">Requer Termo de Consentimento Assinado</Label>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancelar
                    </Button>
                )}
                <Button type="submit">
                    {initialData ? "Salvar Alterações" : "Criar Procedimento"}
                </Button>
            </div>
        </form>
    );
}
