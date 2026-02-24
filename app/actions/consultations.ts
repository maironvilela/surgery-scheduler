"use server";

import prisma from "@/lib/prisma";
import { ConsultationItem } from "@/types";
import { revalidatePath } from "next/cache";

export async function getConsultations(date?: string) {
    try {
        // If date is provided, filter by it. Using simple string comparison for SQLite
        const consultations = await prisma.consultation.findMany({
            orderBy: { time: 'asc' }
        });
        return consultations as ConsultationItem[];
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
                whatsappSent: data.whatsappSent || false,
            }
        });
        revalidatePath("/consultas");
        return consultation;
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
                whatsappSent: data.whatsappSent,
            }
        });
        revalidatePath("/consultas");
        return consultation;
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
