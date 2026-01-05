"use client";

import { useState } from "react";
import { Doctor } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DoctorFormProps {
    onSubmit: (doctor: Omit<Doctor, "id" | "createdAt" | "updatedAt">) => void;
    onCancel: () => void;
    initialData?: Doctor;
}

export function DoctorForm({ onSubmit, onCancel, initialData }: DoctorFormProps) {
    const [formData, setFormData] = useState<Omit<Doctor, "id" | "createdAt" | "updatedAt">>({
        crm: initialData?.crm || "",
        name: initialData?.name || "",
        specialty: initialData?.specialty || "",
        status: initialData?.status || "active",
    });

    const [preview, setPreview] = useState<string | null>(initialData?.photoUrl || null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value as any }));
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setPreview(base64String);
                setFormData((prev) => ({ ...prev, photoUrl: base64String }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col items-center justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-muted bg-muted flex items-center justify-center mb-4">
                    {preview ? (
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-muted-foreground text-4xl">?</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="photo" className="cursor-pointer">
                        <div className="flex items-center gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md transition-colors text-sm font-medium">
                            Alterar Foto
                        </div>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </Label>
                    {preview && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setPreview(null);
                                setFormData(prev => ({ ...prev, photoUrl: undefined }));
                            }}
                        >
                            Remover
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input
                        id="crm"
                        name="crm"
                        placeholder="000000"
                        value={formData.crm}
                        onChange={handleChange}
                        required
                        disabled={!!initialData} // CRM rarely changes
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input
                        id="name"
                        name="name"
                        placeholder="Dr. Nome Sobrenome"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="specialty">Especialidade</Label>
                    <Input
                        id="specialty"
                        name="specialty"
                        placeholder="Ex: Cardiologia"
                        value={formData.specialty}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        name="status"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData.status}
                        onChange={handleChange}
                    >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">
                    {initialData ? "Salvar Alterações" : "Cadastrar Médico"}
                </Button>
            </div>
        </form>
    );
}
