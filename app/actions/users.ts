"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface UserDTO {
    id: string;
    email: string;
    name: string;
    role: string;
    mustChangePassword: boolean;
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
                mustChangePassword: true,
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
    mustChangePassword?: boolean;
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
            mustChangePassword: data.mustChangePassword ?? true,
        },
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            mustChangePassword: true,
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
        mustChangePassword?: boolean;
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
        // Se a senha foi redefinida manualmente pelo admin, exige alteração no próximo acesso
        if (data.mustChangePassword !== undefined) {
            updateData.mustChangePassword = data.mustChangePassword;
        } else {
            updateData.mustChangePassword = true;
        }
    } else if (data.mustChangePassword !== undefined) {
        updateData.mustChangePassword = data.mustChangePassword;
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
            mustChangePassword: true,
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

export async function changeOwnPassword(data: {
    userId: string;
    currentPassword?: string;
    newPassword: string;
}): Promise<void> {
    if (!data.userId || !data.newPassword) {
        throw new Error("Dados incompletos.");
    }

    if (data.newPassword.length < 8) {
        throw new Error("A nova senha deve ter no mínimo 8 caracteres.");
    }

    const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { id: true, passwordHash: true, mustChangePassword: true },
    });

    if (!user) {
        throw new Error("Usuário não encontrado.");
    }

    // Se a senha atual foi informada, valida antes de trocar
    if (data.currentPassword) {
        const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!isValid) {
            throw new Error("A senha atual informada está incorreta.");
        }
    }

    // Impede usar exatamente a mesma senha
    const isSamePassword = await bcrypt.compare(data.newPassword, user.passwordHash);
    if (isSamePassword) {
        throw new Error("A nova senha deve ser diferente da senha atual.");
    }

    const newPasswordHash = await bcrypt.hash(data.newPassword, 12);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            passwordHash: newPasswordHash,
            mustChangePassword: false,
        },
    });

    revalidatePath("/");
}
