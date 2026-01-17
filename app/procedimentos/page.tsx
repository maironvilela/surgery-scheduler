"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import Link from "next/link";
import { ProcedureList } from "@/components/procedures/procedure-list";
import { ProcedureForm } from "@/components/procedures/procedure-form";
import { useProcedure } from "@/context/procedure-context";
import { Procedure } from "@/types";
import { ProcedureFilter, FilterState } from "@/components/procedures/procedure-filter";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function ProceduresPage() {
    const { procedures, addProcedure } = useProcedure();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        name: "",
        code: "",
        specialty: ""
    });
    const [visibleCount, setVisibleCount] = useState(6);

    const filteredProcedures = procedures.filter(procedure => {
        const matchesName = procedure.name.toLowerCase().includes(filters.name.toLowerCase());
        const matchesCode = procedure.code.toLowerCase().includes(filters.code.toLowerCase());
        const matchesSpecialty = procedure.specialty.toLowerCase().includes(filters.specialty.toLowerCase());
        return matchesName && matchesCode && matchesSpecialty;
    });

    const handleCreate = (data: Omit<Procedure, "id" | "createdAt" | "updatedAt">) => {
        addProcedure(data);
        setIsFormOpen(false);
    };

    const currentItems = filteredProcedures.slice(0, visibleCount);
    const hasMore = visibleCount < filteredProcedures.length;

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 6);
    };

    const cancelForm = () => {
        setIsFormOpen(false);
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 -my-4 mb-2">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Gerenciar Procedimentos</h1>
                        <p className="text-muted-foreground">
                            Catálogo de procedimentos cirúrgicos.
                        </p>
                    </div>

                    {!isFormOpen && (
                        <div className="flex gap-2">
                            <Sheet>
                                <SheetTrigger>
                                    <Button variant="outline" size="icon">
                                        <Filter className="h-4 w-4" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent>
                                    <SheetHeader>
                                        <SheetTitle>Filtrar Procedimentos</SheetTitle>
                                        <SheetDescription>
                                            Refine a lista por nome, código ou especialidade.
                                        </SheetDescription>
                                    </SheetHeader>
                                    <ProcedureFilter
                                        onFilter={setFilters}
                                        currentFilters={filters}
                                    />
                                </SheetContent>
                            </Sheet>
                            <Button onClick={() => setIsFormOpen(true)} className="shrink-0 bg-blue-500 hover:bg-blue-600">
                                <Plus className="mr-2 h-4 w-4" /> Novo Procedimento
                            </Button>
                        </div>
                    )}

                </div>
                {!isFormOpen && (
                    <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <h2 className="text-lg font-semibold">Lista de Procedimentos</h2>
                        <div className="text-sm text-muted-foreground">
                            Exibindo {Math.min(visibleCount, filteredProcedures.length)} de {filteredProcedures.length} procedimentos
                        </div>
                    </div>
                )}
            </div>

            {isFormOpen ? (
                <div className="animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-xl font-semibold">
                            Novo Procedimento
                        </h2>
                    </div>
                    <ProcedureForm
                        onSubmit={handleCreate}
                        onCancel={cancelForm}
                    />
                </div>
            ) : (
                <ProcedureList
                    procedures={currentItems}
                    hasMore={hasMore}
                    onLoadMore={handleLoadMore}
                />
            )}
        </div>
    );
}
