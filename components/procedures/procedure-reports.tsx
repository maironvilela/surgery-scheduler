"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, FileText } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Procedure, ProcedureReport } from "@/types";
import { useProcedure } from "@/context/procedure-context";

interface ProcedureReportsProps {
    procedureId: string;
    reports?: ProcedureReport[];
}

export function ProcedureReports({ procedureId, reports = [] }: ProcedureReportsProps) {
    const { updateProcedure } = useProcedure();
    const [newReport, setNewReport] = useState("");

    const handleAddReport = () => {
        if (!newReport.trim()) return;

        const report: ProcedureReport = {
            id: crypto.randomUUID(),
            user: "Você", // In a real app, this would come from auth context
            content: newReport,
            date: new Date().toLocaleString("pt-BR"),
        };

        const updatedReports = [report, ...reports];

        // Update local state if needed, but optimally we update context/server
        updateProcedure(procedureId, { reports: updatedReports });
        setNewReport("");
    };

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Relatórios & Anotações
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
                {/* Input Area */}
                <div className="space-y-2">
                    <Textarea
                        placeholder="Adicionar novo relatório ou observação..."
                        value={newReport}
                        onChange={(e) => setNewReport(e.target.value)}
                        className="min-h-[80px] resize-none"
                    />
                    <div className="flex justify-end">
                        <Button size="sm" onClick={handleAddReport} disabled={!newReport.trim()}>
                            <Send className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>
                </div>

                <Separator />

                {/* Reports List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {reports.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">Nenhum relatório registrado.</p>
                    )}

                    {reports.map((report) => (
                        <div key={report.id} className="flex gap-3 text-sm">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {report.user.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold">{report.user}</span>
                                    <span className="text-xs text-muted-foreground">{report.date}</span>
                                </div>
                                <p className="text-slate-600 leading-relaxed dark:text-slate-300">
                                    {report.content}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
