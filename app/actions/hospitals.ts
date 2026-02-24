"use server";

import prisma from "@/lib/prisma";
import { Hospital } from "@/types";
import { revalidatePath } from "next/cache";

export async function getHospitals() {
    try {
        const hospitals = await prisma.hospital.findMany({
            include: {
                contacts: true
            },
            orderBy: { name: 'asc' }
        });
        return hospitals as Hospital[];
    } catch (error) {
        console.error("Failed to fetch hospitals:", error);
        return [];
    }
}

export async function addHospital(data: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) {
    try {
        const hospital = await prisma.hospital.create({
            data: {
                name: data.name,
                cep: data.cep,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                referencePoint: data.referencePoint,
                contacts: {
                    create: data.contacts.map(contact => ({
                        type: contact.type,
                        value: contact.value,
                        label: contact.label,
                        isPrimary: contact.isPrimary,
                    }))
                }
            },
            include: { contacts: true }
        });
        revalidatePath("/configuracoes");
        return hospital;
    } catch (error) {
        console.error("Failed to add hospital:", error);
        throw new Error("Failed to add hospital");
    }
}

export async function updateHospital(id: string, data: Omit<Hospital, "id" | "createdAt" | "contacts"> & { contacts: any[] }) {
    try {
        // Delete existing contacts and recreate them for simplicity in update
        // A better way would be using connectOrCreate/update but this is simpler for now
        await prisma.hospitalContact.deleteMany({
            where: { hospitalId: id }
        });

        const hospital = await prisma.hospital.update({
            where: { id },
            data: {
                name: data.name,
                cep: data.cep,
                street: data.street,
                number: data.number,
                complement: data.complement,
                neighborhood: data.neighborhood,
                city: data.city,
                state: data.state,
                referencePoint: data.referencePoint,
                contacts: {
                    create: data.contacts.map(contact => ({
                        type: contact.type,
                        value: contact.value,
                        label: contact.label,
                        isPrimary: contact.isPrimary,
                    }))
                }
            },
            include: { contacts: true }
        });
        revalidatePath("/configuracoes");
        return hospital;
    } catch (error) {
        console.error("Failed to update hospital:", error);
        throw new Error("Failed to update hospital");
    }
}

export async function deleteHospital(id: string) {
    try {
        await prisma.hospital.delete({
            where: { id }
        });
        revalidatePath("/configuracoes");
    } catch (error) {
        console.error("Failed to delete hospital:", error);
        throw new Error("Failed to delete hospital");
    }
}
