"use server";

import prisma from "@/lib/prisma";
import { Appointment } from "@/types";
import { revalidatePath } from "next/cache";

export async function createAppointment(data: Omit<Appointment, "id" | "createdAt" | "updatedAt">) {
    try {
        const appointment = await (prisma as any).appointment.create({
            data: {
                patientName: data.patientName,
                patientPhone: data.patientPhone,
                ...(data.insurance ? { insurance: data.insurance } : {}),
                ...(data.plan ? { plan: data.plan } : {}),
                doctorName: data.doctorName,
                specialty: data.specialty,
                appointmentDate: data.appointmentDate,
                appointmentTime: data.appointmentTime,
                fullDatetimeString: data.fullDatetimeString,
                locationName: data.locationName,
                locationAddress: data.locationAddress,
                fromWebsite: data.fromWebsite,
                whatsappMessage: data.whatsappMessage,
                whatsappSent: data.whatsappSent,
                status: data.status || "AGENDADO",
                createdBy: data.createdBy || "Atendente",
            },
        });


        revalidatePath("/agendamento");
        revalidatePath("/consultas");

        return {
            ...appointment,
            createdAt: appointment.createdAt ? new Date(appointment.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt).toISOString() : new Date().toISOString(),
        } as Appointment;
    } catch (error) {
        console.error("Failed to create appointment:", error);
        throw new Error("Erro ao salvar agendamento no banco de dados.");
    }
}

export async function getAppointments(filters?: { date?: string; phone?: string; doctorName?: string; status?: string }) {
    try {
        const where: any = {};
        if (filters?.date) where.appointmentDate = filters.date;
        if (filters?.phone) where.patientPhone = { contains: filters.phone };
        if (filters?.doctorName) where.doctorName = filters.doctorName;
        if (filters?.status) where.status = filters.status;

        const appointments = await (prisma as any).appointment.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });

        return appointments.map((a: any) => ({
            ...a,
            createdAt: a.createdAt ? new Date(a.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: a.updatedAt ? new Date(a.updatedAt).toISOString() : new Date().toISOString(),
        })) as Appointment[];
    } catch (error) {
        console.error("Failed to fetch appointments:", error);
        return [];
    }
}

export async function updateAppointmentStatus(id: string, status: string, whatsappSent?: boolean) {
    try {
        const appointment = await (prisma as any).appointment.update({
            where: { id },
            data: {
                status,
                ...(whatsappSent !== undefined ? { whatsappSent } : {}),
            },
        });

        revalidatePath("/agendamento");
        revalidatePath("/consultas");

        return {
            ...appointment,
            createdAt: appointment.createdAt ? new Date(appointment.createdAt).toISOString() : new Date().toISOString(),
            updatedAt: appointment.updatedAt ? new Date(appointment.updatedAt).toISOString() : new Date().toISOString(),
        } as Appointment;
    } catch (error) {
        console.error("Failed to update appointment status:", error);
        throw new Error("Erro ao atualizar status do agendamento.");
    }
}

export async function deleteAppointment(id: string) {
    try {
        await (prisma as any).appointment.delete({
            where: { id },
        });

        revalidatePath("/agendamento");
        revalidatePath("/consultas");
    } catch (error) {
        console.error("Failed to delete appointment:", error);
        throw new Error("Erro ao excluir agendamento.");
    }
}

