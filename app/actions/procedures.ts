"use server";

import prisma from "@/lib/prisma";
import { Procedure } from "@/types";
import { revalidatePath } from "next/cache";

export async function getProcedures() {
    try {
        const procedures = await prisma.procedure.findMany({
            include: {
                reports: true
            },
            orderBy: { name: 'asc' }
        });
        return procedures.map((p: any) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            updatedAt: p.updatedAt.toISOString(),
        })) as Procedure[];
    } catch (error) {
        console.error("Failed to fetch procedures:", error);
        return [];
    }
}

export async function addProcedure(data: Omit<Procedure, "id" | "createdAt" | "updatedAt" | "reports">) {
    try {
        const procedure = await prisma.procedure.create({
            data: {
                code: data.code,
                name: data.name,
                specialty: data.specialty,
                fastingTime: data.fastingTime,
                estimatedDuration: data.estimatedDuration,
                anesthesiaType: data.anesthesiaType,
                equipment: data.equipment,
                materials: data.materials,
                bloodRequirement: data.bloodRequirement,
                teamSize: data.teamSize,
                recoveryTimePACU: data.recoveryTimePACU,
                recoveryTimeICU: data.recoveryTimeICU,
                hospitalizationTime: data.hospitalizationTime,
                homeRecoveryTime: data.homeRecoveryTime,
                suggestedCertificateTime: data.suggestedCertificateTime,
                consentForm: data.consentForm,
            },
            include: { reports: true }
        });
        revalidatePath("/procedimentos");
        return {
            ...procedure,
            createdAt: procedure.createdAt.toISOString(),
            updatedAt: procedure.updatedAt.toISOString(),
        } as Procedure;
    } catch (error) {
        console.error("Failed to add procedure:", error);
        throw new Error("Failed to add procedure");
    }
}

export async function updateProcedure(id: string, data: Partial<Omit<Procedure, "id" | "createdAt" | "updatedAt" | "reports">>) {
    try {
        const procedure = await prisma.procedure.update({
            where: { id },
            data: {
                code: data.code,
                name: data.name,
                specialty: data.specialty,
                fastingTime: data.fastingTime,
                estimatedDuration: data.estimatedDuration,
                anesthesiaType: data.anesthesiaType,
                equipment: data.equipment,
                materials: data.materials,
                bloodRequirement: data.bloodRequirement,
                teamSize: data.teamSize,
                recoveryTimePACU: data.recoveryTimePACU,
                recoveryTimeICU: data.recoveryTimeICU,
                hospitalizationTime: data.hospitalizationTime,
                homeRecoveryTime: data.homeRecoveryTime,
                suggestedCertificateTime: data.suggestedCertificateTime,
                consentForm: data.consentForm,
            },
            include: { reports: true }
        });
        revalidatePath("/procedimentos");
        return {
            ...procedure,
            createdAt: procedure.createdAt.toISOString(),
            updatedAt: procedure.updatedAt.toISOString(),
        } as Procedure;
    } catch (error) {
        console.error("Failed to update procedure:", error);
        throw new Error("Failed to update procedure");
    }
}

export async function deleteProcedure(id: string) {
    try {
        await prisma.procedure.delete({
            where: { id }
        });
        revalidatePath("/procedimentos");
    } catch (error) {
        console.error("Failed to delete procedure:", error);
        throw new Error("Failed to delete procedure");
    }
}

export async function addProcedureReport(procedureId: string, report: { user: string; avatar?: string; content: string; date: string }) {
    try {
        const newReport = await prisma.procedureReport.create({
            data: {
                ...report,
                procedureId
            }
        });
        revalidatePath("/procedimentos");
        return newReport;
    } catch (error) {
        console.error("Failed to add report:", error);
        throw new Error("Failed to add report");
    }
}
