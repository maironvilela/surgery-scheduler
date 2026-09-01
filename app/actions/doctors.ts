"use server";

import prisma from "@/lib/prisma";
import { Doctor } from "@/types";
import { revalidatePath } from "next/cache";

const DEFAULT_DOCTORS = [
    { crm: "MG-1001", name: "Dr. Rômulo Oliveira", specialty: "Ortopedia (Especialista em Coluna)", status: "active" },
    { crm: "MG-1002", name: "Dr. Sávio Laborne", specialty: "Ortopedia (Especialista em Coluna)", status: "active" },
    { crm: "MG-1003", name: "Dr. Jader de Andrade", specialty: "Ortopedia (Especialista em Coluna)", status: "active" },
    { crm: "MG-1004", name: "Dr. Tiago Falci", specialty: "Ortopedia (Especialista em Coluna)", status: "active" },
    { crm: "MG-1005", name: "Dra. Iara Fernandes", specialty: "Reumatologia", status: "active" },
];

export async function getDoctors() {
    try {
        // Auto-seed missing default doctors into DB table
        for (const doc of DEFAULT_DOCTORS) {
            const existing = await prisma.doctor.findFirst({
                where: {
                    OR: [{ name: doc.name }, { crm: doc.crm }],
                },
            });
            if (!existing) {
                await prisma.doctor.create({ data: doc });
            }
        }

        const doctors = await prisma.doctor.findMany({
            orderBy: { name: 'asc' }
        });
        return doctors.map((d: any) => ({
            ...d,
            createdAt: d.createdAt.toISOString(),
            updatedAt: d.updatedAt.toISOString(),
            status: d.status as 'active' | 'inactive'
        })) as Doctor[];
    } catch (error) {
        console.error("Failed to fetch doctors:", error);
        return [];
    }
}


export async function addDoctor(data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) {
    try {
        const doctor = await prisma.doctor.create({
            data: {
                crm: data.crm,
                name: data.name,
                specialty: data.specialty,
                photoUrl: data.photoUrl,
                status: data.status,
            }
        });
        revalidatePath("/configuracoes"); // Assuming doctors are managed here
        return {
            ...doctor,
            createdAt: doctor.createdAt.toISOString(),
            updatedAt: doctor.updatedAt.toISOString(),
            status: doctor.status as 'active' | 'inactive'
        } as Doctor;
    } catch (error) {
        console.error("Failed to add doctor:", error);
        throw new Error("Failed to add doctor");
    }
}

export async function updateDoctor(id: string, data: Omit<Doctor, "id" | "createdAt" | "updatedAt">) {
    try {
        const doctor = await prisma.doctor.update({
            where: { id },
            data: {
                crm: data.crm,
                name: data.name,
                specialty: data.specialty,
                photoUrl: data.photoUrl,
                status: data.status,
            }
        });
        revalidatePath("/configuracoes");
        return {
            ...doctor,
            createdAt: doctor.createdAt.toISOString(),
            updatedAt: doctor.updatedAt.toISOString(),
            status: doctor.status as 'active' | 'inactive'
        } as Doctor;
    } catch (error) {
        console.error("Failed to update doctor:", error);
        throw new Error("Failed to update doctor");
    }
}

export async function deleteDoctor(id: string) {
    try {
        await prisma.doctor.delete({
            where: { id }
        });
        revalidatePath("/configuracoes");
    } catch (error) {
        console.error("Failed to delete doctor:", error);
        throw new Error("Failed to delete doctor");
    }
}
