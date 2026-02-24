"use server";

import prisma from "@/lib/prisma";
import { Doctor } from "@/types";
import { revalidatePath } from "next/cache";

export async function getDoctors() {
    try {
        const doctors = await prisma.doctor.findMany({
            orderBy: { name: 'asc' }
        });
        return doctors as Doctor[];
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
        return doctor;
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
        return doctor;
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
