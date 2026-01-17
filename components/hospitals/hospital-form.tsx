"use client";

import { useState } from "react";
import { Hospital, HospitalContact } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch"; // Assuming you have a Switch or similar
import { Plus, Trash2 } from "lucide-react";

interface HospitalFormProps {
    onSubmit: (hospital: Omit<Hospital, "id" | "createdAt">) => void;
    onCancel: () => void;
    initialData?: Hospital;
}

export function HospitalForm({ onSubmit, onCancel, initialData }: HospitalFormProps) {
    const [formData, setFormData] = useState<Omit<Hospital, "id" | "createdAt">>({
        name: initialData?.name || "",
        contacts: initialData?.contacts || [
            { id: "temp-1", type: "phone", value: "", label: "Principal", isPrimary: true },
            { id: "temp-2", type: "email", value: "", label: "Principal", isPrimary: true }
        ],

        // Address
        cep: initialData?.cep || "",
        street: initialData?.street || "",
        number: initialData?.number || "",
        complement: initialData?.complement || "",
        neighborhood: initialData?.neighborhood || "",
        city: initialData?.city || "",
        state: initialData?.state || "",
        referencePoint: initialData?.referencePoint || "",
    });

    const [isLoadingCep, setIsLoadingCep] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Contact Handlers
    const addContact = () => {
        setFormData(prev => ({
            ...prev,
            contacts: [
                ...prev.contacts,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    type: "phone",
                    value: "",
                    label: "",
                    isPrimary: false
                }
            ]
        }));
    };

    const removeContact = (id: string) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.filter(c => c.id !== id)
        }));
    };

    const updateContact = (id: string, field: keyof HospitalContact, value: any) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.map(c => {
                if (c.id === id) {
                    return { ...c, [field]: value };
                }
                return c;
            })
        }));
    };

    const setPrimaryContact = (type: 'phone' | 'email', id: string) => {
        setFormData(prev => ({
            ...prev,
            contacts: prev.contacts.map(c => {
                if (c.type === type) {
                    return { ...c, isPrimary: c.id === id };
                }
                return c;
            })
        }));
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
            {/* Card: Dados do Hospital */}
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                    Dados do Hospital
                </h3>
                <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Hospital</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Ex: Hospital Santa Casa"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Contatos</Label>
                        <div className="space-y-3">
                            {formData.contacts.map((contact) => (
                                <div key={contact.id} className="flex flex-col md:flex-row gap-2 items-start md:items-center border p-3 rounded-md bg-muted/20">
                                    <div className="w-full md:w-32">
                                        <Select
                                            value={contact.type}
                                            onValueChange={(val) => updateContact(contact.id, "type", val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="phone">Telefone</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <Input
                                            placeholder={contact.type === "phone" ? "(00) 00000-0000" : "email@exemplo.com"}
                                            value={contact.value}
                                            onChange={(e) => updateContact(contact.id, "value", e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="w-full md:w-40">
                                        <Input
                                            placeholder="Rótulo (ex: Comercial)"
                                            value={contact.label || ""}
                                            onChange={(e) => updateContact(contact.id, "label", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className={`cursor-pointer px-2 py-1 rounded text-xs font-medium border ${contact.isPrimary
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background text-muted-foreground border-input hover:bg-accent"
                                                }`}
                                            onClick={() => setPrimaryContact(contact.type, contact.id)}
                                            title="Definir como principal para este tipo"
                                        >
                                            {contact.isPrimary ? "Principal" : "Tornar Principal"}
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive/90"
                                            onClick={() => removeContact(contact.id)}
                                            disabled={formData.contacts.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={addContact} className="mt-2">
                                <Plus className="h-4 w-4 mr-2" /> Adicionar Contato
                            </Button>
                        </div>
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
                            placeholder="Bloco Cirúrgico"
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
                    <div className="space-y-2 md:col-span-4">
                        <Label htmlFor="referencePoint">Ponto de Referência</Label>
                        <Textarea
                            id="referencePoint"
                            name="referencePoint"
                            placeholder="Próximo a..."
                            value={formData.referencePoint}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={isLoadingCep}>
                    {initialData ? "Salvar Alterações" : "Cadastrar Hospital"}
                </Button>
            </div>
        </form>
    );
}
