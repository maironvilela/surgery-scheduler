"use server";

import prisma from "@/lib/prisma";
import { Surgery } from "@/types";
import { revalidatePath } from "next/cache";

export async function getSurgeries() {
    try {
        const surgeries = await prisma.surgery.findMany({
            include: {
                comments: true
            },
            orderBy: { date: 'asc' }
        });
        return surgeries as Surgery[];
    } catch (error) {
        console.error("Failed to fetch surgeries:", error);
        return [];
    }
}

export async function addSurgery(data: Omit<Surgery, "id" | "createdAt" | "comments"> & { comments: any[] }) {
    try {
        const surgery = await prisma.surgery.create({
            data: {
                patientId: data.patientId,
                patientName: data.patientName,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                hospitalId: data.hospitalId,
                hospitalName: data.hospitalName,
                procedure: data.procedure,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
                status: data.status,
                notes: data.notes,
                comments: {
                    create: data.comments?.map(comment => ({
                        user: comment.user,
                        date: comment.date,
                        content: comment.content
                    }))
                }
            },
            include: { comments: true }
        });
        revalidatePath("/agenda");
        return surgery as Surgery;
    } catch (error) {
        console.error("Failed to add surgery:", error);
        throw new Error("Failed to add surgery");
    }
}

export async function updateSurgery(id: string, data: Partial<Omit<Surgery, "id" | "createdAt" | "comments">>) {
    try {
        const surgery = await prisma.surgery.update({
            where: { id },
            data: {
                patientId: data.patientId,
                patientName: data.patientName,
                doctorId: data.doctorId,
                doctorName: data.doctorName,
                hospitalId: data.hospitalId,
                hospitalName: data.hospitalName,
                procedure: data.procedure,
                date: data.date,
                startTime: data.startTime,
                endTime: data.endTime,
                room: data.room,
                status: data.status,
                notes: data.notes,
            },
            include: { comments: true }
        });
        revalidatePath("/agenda");
        return surgery as Surgery;
    } catch (error) {
        console.error("Failed to update surgery:", error);
        throw new Error("Failed to update surgery");
    }
}

export async function deleteSurgery(id: string) {
    try {
        await prisma.surgery.delete({
            where: { id }
        });
        revalidatePath("/agenda");
    } catch (error) {
        console.error("Failed to delete surgery:", error);
        throw new Error("Failed to delete surgery");
    }
}

export async function addSurgeryComment(surgeryId: string, comment: { user: string; date: string; content: string }) {
    try {
        const newComment = await prisma.comment.create({
            data: {
                ...comment,
                surgeryId
            }
        });
        revalidatePath("/agenda");
        return newComment;
    } catch (error) {
        console.error("Failed to add comment:", error);
        throw new Error("Failed to add comment");
    }
}
