"use client";

import { useState } from "react";
import { Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PatientFormProps {
    onSubmit: (patient: Omit<Patient, "id" | "createdAt">) => void;
    onCancel: () => void;
    initialData?: Patient;
}

export function PatientForm({ onSubmit, onCancel, initialData }: PatientFormProps) {
    const [formData, setFormData] = useState<Omit<Patient, "id" | "createdAt">>({
        name: initialData?.name || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        birthDate: initialData?.birthDate || "",
        gender: initialData?.gender || "male",

        // Insurance
        insurance: initialData?.insurance || "",
        plan: initialData?.plan || "",

        // Address
        cep: initialData?.cep || "",
        street: initialData?.street || "",
        number: initialData?.number || "",
        complement: initialData?.complement || "",
        neighborhood: initialData?.neighborhood || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
    });

    const [isLoadingCep, setIsLoadingCep] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleCepBlur = async () => {
        const cep = formData.cep.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setIsLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();

            if (data.erro) {
                alert("CEP não encontrado!");
                return;
            }

            setFormData(prev => ({
                ...prev,
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf
            }));
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
            alert("Erro ao buscar CEP. Verifique sua conexão.");
        } finally {
            setIsLoadingCep(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card: Dados Pessoais */}
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    Dados Pessoais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Maria Silva"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="birthDate">Data de Nascimento</Label>
                        <Input
                            id="birthDate"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gender">Gênero</Label>
                        <select
                            id="gender"
                            name="gender"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="male">Masculino</option>
                            <option value="female">Feminino</option>
                            <option value="other">Outro</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                            id="phone"
                            name="phone"
                            placeholder="(00) 00000-0000"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email">Email (Opcional)</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="email@exemplo.com"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            {/* Card: Convênio */}
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Convênio</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="insurance">Convênio</Label>
                        <Input
                            id="insurance"
                            name="insurance"
                            placeholder="Ex: Unimed"
                            value={formData.insurance}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="plan">Plano</Label>
                        <Input
                            id="plan"
                            name="plan"
                            placeholder="Ex: Básico"
                            value={formData.plan}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>

            {/* Card: Endereço */}
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <h3 className="font-semibold text-lg">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="cep">CEP</Label>
                        <Input
                            id="cep"
                            name="cep"
                            placeholder="00000-000"
                            value={formData.cep}
                            onChange={handleChange}
                            onBlur={handleCepBlur}
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="street">Logradouro</Label>
                        <Input
                            id="street"
                            name="street"
                            placeholder="Rua, Avenida..."
                            value={formData.street}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="number">Número</Label>
                        <Input
                            id="number"
                            name="number"
                            placeholder="123"
                            value={formData.number}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                            id="complement"
                            name="complement"
                            placeholder="Apto 101"
                            value={formData.complement}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input
                            id="neighborhood"
                            name="neighborhood"
                            placeholder="Centro"
                            value={formData.neighborhood}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2 md:col-span-3">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">UF</Label>
                        <Input
                            id="state"
                            name="state"
                            maxLength={2}
                            value={formData.state}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
            </div>


            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoadingCep}>
                    {initialData ? "Salvar Alterações" : "Cadastrar Paciente"}
                </Button>
            </div>
        </form>
    );
}
