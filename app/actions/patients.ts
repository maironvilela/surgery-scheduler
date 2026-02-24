"use server";

import prisma from "@/lib/prisma";
import { Patient } from "@/types";
import { revalidatePath } from "next/cache";

export async function getPatients() {
    try {
        const patients = await prisma.patient.findMany({
            orderBy: { name: 'asc' }
        });
        // Convert DateTime and ensure fields match Patient interface
        return patients.map((p: any) => ({
            ...p,
            createdAt: p.createdAt.toISOString(),
            insurance: p.insurance || "",
            plan: p.plan || "",
            birthDate: p.birthDate || "",
            cep: p.cep || "",
            street: p.street || "",
            number: p.number || "",
            complement: p.complement || "",
            neighborhood: p.neighborhood || "",
            city: p.city || "",
            state: p.state || "",
            phone: p.phone || "",
            email: p.email || "",
        })) as Patient[];
    } catch (error) {
        console.error("Failed to fetch patients:", error);
        return [];
    }
}

export async function addPatient(data: Omit<Patient, "id" | "createdAt">) {
    try {
        const patient = await prisma.patient.create({
            data: {
                name: data.name,
                insurance: data.insurance,
                plan: data.plan,
                birthDate: data.birthDate,
                gender: data.gender,
                cep: data.cep,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                phone: data.phone,
                email: data.email,
            }
        });
        revalidatePath("/pacientes");
        return { ...patient, createdAt: patient.createdAt.toISOString() };
    } catch (error) {
        console.error("Failed to add patient:", error);
        throw new Error("Failed to add patient");
    }
}

export async function updatePatient(id: string, data: Omit<Patient, "id" | "createdAt">) {
    try {
        const patient = await prisma.patient.update({
            where: { id },
            data: {
                name: data.name,
                insurance: data.insurance,
                plan: data.plan,
                birthDate: data.birthDate,
                gender: data.gender,
                cep: data.cep,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                phone: data.phone,
                email: data.email,
            }
        });
        revalidatePath("/pacientes");
        return { ...patient, createdAt: patient.createdAt.toISOString() };
    } catch (error) {
        console.error("Failed to update patient:", error);
        throw new Error("Failed to update patient");
    }
}

export async function deletePatient(id: string) {
    try {
        await prisma.patient.delete({
            where: { id }
        });
        revalidatePath("/pacientes");
    } catch (error) {
        console.error("Failed to delete patient:", error);
        throw new Error("Failed to delete patient");
    }
}
