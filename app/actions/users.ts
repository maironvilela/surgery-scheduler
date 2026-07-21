"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface UserDTO {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
}

export async function getUsers(): Promise<UserDTO[]> {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return users.map((u) => ({
            ...u,
            createdAt: u.createdAt.toISOString(),
        }));
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
    }
}

export async function createUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
}): Promise<UserDTO> {
    const cleanEmail = data.email.toLowerCase().trim();
    const cleanName = data.name.trim();

    if (!cleanName || !cleanEmail || !data.password) {
        throw new Error("Preencha todos os campos obrigatórios.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
        throw new Error("Formato de e-mail inválido.");
    }

    if (data.password.length < 8) {
        throw new Error("A senha deve conter no mínimo 8 caracteres.");
    }

    // Verifica se e-mail já existe
    const existing = await prisma.user.findUnique({
        where: { email: cleanEmail },
    });

    if (existing) {
        throw new Error("Já existe um usuário cadastrado com este e-mail.");
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
        data: {
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role: data.role || "user",
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });

    revalidatePath("/usuarios");

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
    };
}

export async function updateUser(
    id: string,
    data: {
        name?: string;
        email?: string;
        password?: string;
        role?: string;
    }
): Promise<UserDTO> {
    const updateData: Record<string, any> = {};

    if (data.name) {
        updateData.name = data.name.trim();
    }

    if (data.email) {
        const cleanEmail = data.email.toLowerCase().trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            throw new Error("Formato de e-mail inválido.");
        }

        const existing = await prisma.user.findUnique({
            where: { email: cleanEmail },
        });

        if (existing && existing.id !== id) {
            throw new Error("Este e-mail já está sendo utilizado por outro usuário.");
        }

        updateData.email = cleanEmail;
    }

    if (data.password && data.password.trim() !== "") {
        if (data.password.length < 8) {
            throw new Error("A nova senha deve conter no mínimo 8 caracteres.");
        }
        updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }

    if (data.role) {
        updateData.role = data.role;
    }

    const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
        },
    });

    revalidatePath("/usuarios");

    return {
        ...user,
        createdAt: user.createdAt.toISOString(),
    };
}

export async function deleteUser(id: string): Promise<void> {
    // Impede excluir se for o único usuário do sistema
    const totalUsers = await prisma.user.count();
    if (totalUsers <= 1) {
        throw new Error("Não é possível excluir o único usuário do sistema.");
    }

    await prisma.user.delete({
        where: { id },
    });

    revalidatePath("/usuarios");
}
