"use client";

import { useState } from "react";
import { Procedure } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Activity, Clock, FileText } from "lucide-react";
import Link from "next/link";

export interface ProcedureListProps {
    procedures: Procedure[];
    hasMore: boolean;
    onLoadMore: () => void;
}

export function ProcedureList({ procedures, hasMore, onLoadMore }: ProcedureListProps) {
    if (procedures.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mb-4 opacity-20" />
                <p>Nenhum procedimento encontrado.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
                {procedures.map((procedure) => (
                    <Card key={procedure.id} className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                        <CardContent className="p-0">
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold text-lg">{procedure.name}</h3>
                                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                                            Code: {procedure.code}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center text-muted-foreground bg-muted/30 p-2 rounded-md">
                                        <Activity className="h-4 w-4 mr-2" />
                                        {procedure.specialty}
                                    </div>
                                    <div className="flex items-center text-muted-foreground px-2">
                                        <Clock className="h-4 w-4 mr-2" />
                                        {procedure.estimatedDuration}
                                    </div>
                                    <div className="flex items-center text-muted-foreground px-2">
                                        <FileText className="h-4 w-4 mr-2" />
                                        {procedure.consentForm ? "Termo OK" : "Termo Pendente"}
                                    </div>
                                </div>

                                <div className="pt-2 border-t mt-4">
                                    <Link href={`/procedimentos/${procedure.id}`} className="w-full block">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full"
                                        >
                                            Detalhes
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-4">
                    <Button variant="outline" onClick={onLoadMore}>
                        Carregar Mais
                    </Button>
                </div>
            )}
        </div>
    );
}
