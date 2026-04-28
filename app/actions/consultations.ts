"use server";

import prisma from "@/lib/prisma";
import { ConsultationItem } from "@/types";
import { revalidatePath } from "next/cache";

export async function getConsultations(date?: string) {
    try {
        // If date is provided, filter by it. Using simple string comparison for SQLite
        const consultations = await prisma.consultation.findMany({
            where: date ? {
                date: {
                    gte: new Date(date + "T00:00:00Z"),
                    lte: new Date(date + "T23:59:59Z")
                }
            } : undefined,
            orderBy: { time: 'asc' }
        });
        return consultations.map(c => ({
            ...c,
            date: c.date.toISOString()
        })) as ConsultationItem[];
    } catch (error) {
        console.error("Failed to fetch consultations:", error);
        return [];
    }
}

export async function addConsultation(data: Omit<ConsultationItem, "id">) {
    try {
        const consultation = await prisma.consultation.create({
            data: {
                patientName: data.patientName,
                phone: data.phone,
                status: data.status,
                time: data.time,
                date: data.date ? new Date(data.date) : undefined,
                whatsappSent: data.whatsappSent || false,
                isArchived: data.isArchived || false,
                doctorId: data.doctorId || undefined,
                hospitalId: data.hospitalId || undefined,
                insurance: data.insurance,
                observations: data.observations,
            }
        });
        revalidatePath("/consultas");
        return {
            ...consultation,
            date: consultation.date.toISOString()
        } as ConsultationItem;
    } catch (error) {
        console.error("Failed to add consultation:", error);
        throw new Error("Failed to add consultation");
    }
}

export async function updateConsultation(id: string, data: Partial<Omit<ConsultationItem, "id">>) {
    try {
        const consultation = await prisma.consultation.update({
            where: { id },
            data: {
                patientName: data.patientName,
                phone: data.phone,
                status: data.status,
                time: data.time,
                date: data.date ? new Date(data.date) : undefined,
                whatsappSent: data.whatsappSent,
                isArchived: data.isArchived,
                doctorId: data.doctorId || undefined,
                hospitalId: data.hospitalId || undefined,
                insurance: data.insurance,
                observations: data.observations,
            }
        });
        revalidatePath("/consultas");
        return {
            ...consultation,
            date: consultation.date.toISOString()
        } as ConsultationItem;
    } catch (error) {
        console.error("Failed to update consultation:", error);
        throw new Error("Failed to update consultation");
    }
}

export async function deleteConsultation(id: string) {
    try {
        await prisma.consultation.delete({
            where: { id }
        });
        revalidatePath("/consultas");
    } catch (error) {
        console.error("Failed to delete consultation:", error);
        throw new Error("Failed to delete consultation");
    }
}

export async function deleteAllConsultations() {
    try {
        await prisma.consultation.deleteMany({
            where: {
                isArchived: false
            }
        });
        revalidatePath("/consultas");
    } catch (error) {
        console.error("Failed to clear consultations:", error);
        throw new Error("Failed to clear consultations");
    }
}
