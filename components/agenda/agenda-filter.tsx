"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter } from "lucide-react";

export function AgendaFilter() {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle filter logic here
        console.log("Filtering...");
    }

    return (
        <Sheet>
            <SheetTrigger>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                    <SheetTitle>Filtrar Agenda</SheetTitle>
                </SheetHeader>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-6">
                    <div className="space-y-2">
                        <Label htmlFor="doctor">Médico</Label>
                        <Input id="doctor" placeholder="Nome do médico" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="procedure">Procedimento</Label>
                        <Input id="procedure" placeholder="Ex: Colecistectomia" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="hospital">Hospital</Label>
                        <Input id="hospital" placeholder="Nome do hospital" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="patient">Paciente</Label>
                        <Input id="patient" placeholder="Nome do paciente" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date">Data Específica</Label>
                        <Input id="date" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label>Período</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="start-date" className="text-xs text-muted-foreground">De</Label>
                                <Input id="start-date" type="date" className="text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="end-date" className="text-xs text-muted-foreground">Até</Label>
                                <Input id="end-date" type="date" className="text-sm" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <Button type="submit" className="flex-1">Aplicar</Button>
                        <Button type="reset" variant="outline" className="flex-1">Limpar</Button>
                    </div>
                </form>
            </SheetContent>
        </Sheet>
    )
}
