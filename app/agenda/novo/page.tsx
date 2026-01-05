import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewAppointmentPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/agenda">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                        Novo Agendamento
                    </h2>
                    <p className="text-slate-500">
                        Preencha os dados abaixo para agendar uma nova cirurgia.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {/* Seção 1: Dados Pessoais */}
                <Card>
                    <CardHeader>
                        <CardTitle>Paciente e Médico</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="patient">Nome do Paciente</Label>
                            <Input id="patient" placeholder="Buscar paciente..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="doctor">Cirurgião Responsável</Label>
                            <Input id="doctor" placeholder="Buscar médico..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="anesthetist">Anestesista (Opcional)</Label>
                            <Input id="anesthetist" placeholder="Buscar anestesista..." />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="insurance">Convênio</Label>
                            <Input id="insurance" placeholder="Ex: Unimed, Bradesco..." />
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 2: Detalhes do Procedimento */}
                <Card>
                    <CardHeader>
                        <CardTitle>Detalhes do Procedimento</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="procedure">Nome do Procedimento</Label>
                            <Input id="procedure" placeholder="Ex: Apendicectomia..." />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date">Data</Label>
                                <Input id="date" type="date" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="room">Sala</Label>
                                <select
                                    id="room"
                                    className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                                >
                                    <option value="">Selecione...</option>
                                    <option value="1">Sala 01</option>
                                    <option value="2">Sala 02</option>
                                    <option value="3">Sala 03</option>
                                    <option value="4">Sala 04</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startTime">Início Previsto</Label>
                                <Input id="startTime" type="time" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endTime">Fim Previsto</Label>
                                <Input id="endTime" type="time" />
                            </div>
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="type">Tipo de Cirurgia</Label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="radio" name="type" className="text-primary focus:ring-primary" /> Eletiva
                                </label>
                                <label className="flex items-center gap-2 text-sm text-slate-700">
                                    <input type="radio" name="type" className="text-primary focus:ring-primary" /> Urgência
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seção 3: Observações */}
                <Card>
                    <CardHeader>
                        <CardTitle>Observações</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Materiais especiais, alergias, recomendações específicas..."
                            className="min-h-[120px]"
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Link href="/agenda">
                        <Button variant="ghost" type="button">Cancelar</Button>
                    </Link>
                    <Button type="submit">Agendar Cirurgia</Button>
                </div>
            </div>
        </div>
    );
}
