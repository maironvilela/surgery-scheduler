"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Surgery } from "@/types";
import { usePatients } from "@/context/patient-context";
import { useDoctors } from "@/context/doctor-context";
import { useHospitals } from "@/context/hospital-context";
import { useProcedure } from "@/context/procedure-context";

interface AgendaFormProps {
    onSubmit: (data: Omit<Surgery, "id" | "createdAt">) => void;
    onCancel: () => void;
    initialData?: Surgery;
}

export function AgendaForm({ onSubmit, onCancel, initialData }: AgendaFormProps) {
    const { patients } = usePatients();
    const { doctors } = useDoctors();
    const { hospitals } = useHospitals();

    const [formData, setFormData] = useState<Omit<Surgery, "id" | "createdAt">>(
        initialData || {
            patientId: "",
            patientName: "",
            doctorId: "",
            doctorName: "",
            hospitalId: "",
            hospitalName: "",
            procedure: "",
            date: "",
            startTime: "",
            endTime: "",
            room: "",
            status: "scheduled",
            notes: ""
        }
    );

    const { procedures } = useProcedure();

    // Helper to add duration to time string "HH:mm"
    const calculateEndTime = (startTime: string, durationStr: string) => {
        try {
            const [startH, startM] = startTime.split(':').map(Number);
            let durationMinutes = 0;

            // Very basic parsing for "2h", "30m", "1h 30m" etc.
            // Improve regex as needed for "Tempo Estimado" format
            const hMatch = durationStr.match(/(\d+)\s*h/i);
            const mMatch = durationStr.match(/(\d+)\s*m/i);

            if (hMatch) durationMinutes += parseInt(hMatch[1]) * 60;
            if (mMatch) durationMinutes += parseInt(mMatch[1]);

            // Fallback: if just a number try to guess or default? 
            // For now assuming the standard format used in mock data "1h", "2h", "120 min" logic could be added
            if (durationMinutes === 0) return "";

            const totalMinutes = startH * 60 + startM + durationMinutes;
            const endH = Math.floor(totalMinutes / 60) % 24;
            const endM = totalMinutes % 60;

            return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        } catch (e) {
            return "";
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        if (name === "startTime") {
            setFormData((prev) => {
                const updates: any = { [name]: value };
                // If we have a procedure selected, try to recalc end time
                // We need to find the current procedure object to get duration.
                // However, we only stored the name strings in formData. 
                // We should store IDs ideally, but the surgery type uses 'procedure' string.
                // Let's try to find by name.
                const currentProc = procedures.find(p => p.name === prev.procedure);
                if (currentProc && value) {
                    const newEnd = calculateEndTime(value, currentProc.estimatedDuration);
                    if (newEnd) updates.endTime = newEnd;
                }
                return { ...prev, ...updates };
            });
        } else {
            setFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleSelectChange = (field: string, value: string) => {
        setFormData((prev) => {
            const updates: any = { [field]: value };

            // Auto-populate names when ID changes
            if (field === 'patientId') {
                const p = patients.find(i => i.id === value);
                if (p) updates.patientName = p.name;
            }
            if (field === 'doctorId') {
                const d = doctors.find(i => i.id === value);
                if (d) updates.doctorName = d.name;
            }
            if (field === 'hospitalId') {
                const h = hospitals.find(i => i.id === value);
                if (h) updates.hospitalName = h.name;
            }
            // Logic for procedure selection
            if (field === 'procedure') {
                // Here 'value' is actually the procedure NAME because we are mapping SelectItem value={p.name}
                // (Since Surgery type uses string for procedure, and we want to store the name)
                // OR we could use ID and lookup name. Let's stick to Name for now to match `Surgery` type simple string.
                // WAIT: If we use ID in value, we can lookup. 
                // Let's change the Select below to use ID as value? 
                // Actually the `Surgery` type says `procedure: string`. Usually implies name in this context.
                // Let's use name as ID for simplicity OR find by name. 
                // Let's assume procedure names are unique enough for this mock.
                // Actually, I'll pass the ID as value to Select, and then find the object.

                // Correction: The Select below handles `formData.procedure`. 
                // If I change value to ID, formData.procedure becomes ID.
                // But existing data might be "Appendectomy" (name). 
                // Let's try to keep `formData.procedure` as the NAME.
                // So the Select `onValueChange` will give us the selected NAME directly if we set `value={p.name}`.

                const proc = procedures.find(p => p.name === value);
                if (proc) {
                    // Auto-calc time if start time exists
                    if (prev.startTime) {
                        const newEnd = calculateEndTime(prev.startTime, proc.estimatedDuration);
                        if (newEnd) updates.endTime = newEnd;
                    }
                    // Auto-fill other fields? (Maybe notes with equipment?)
                    // For now just time.
                }
            }

            return { ...prev, ...updates };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
                <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Patient */}
                    <div className="space-y-2">
                        <Label htmlFor="patientId">Paciente</Label>
                        <Select
                            value={formData.patientId}
                            onValueChange={(val) => handleSelectChange("patientId", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o paciente" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Doctor */}
                    <div className="space-y-2">
                        <Label htmlFor="doctorId">Médico</Label>
                        <Select
                            value={formData.doctorId}
                            onValueChange={(val) => handleSelectChange("doctorId", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o médico" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map((d) => (
                                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hospital */}
                    <div className="space-y-2">
                        <Label htmlFor="hospitalId">Hospital</Label>
                        <Select
                            value={formData.hospitalId}
                            onValueChange={(val) => handleSelectChange("hospitalId", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o hospital" />
                            </SelectTrigger>
                            <SelectContent>
                                {hospitals.map((h) => (
                                    <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Procedure */}
                    <div className="space-y-2">
                        <Label htmlFor="procedure">Procedimento</Label>
                        <Select
                            value={formData.procedure}
                            onValueChange={(val) => handleSelectChange("procedure", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o procedimento" />
                            </SelectTrigger>
                            <SelectContent>
                                {procedures.map((p) => (
                                    <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="date">Data</Label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Room */}
                    <div className="space-y-2">
                        <Label htmlFor="room">Sala</Label>
                        <Input
                            id="room"
                            name="room"
                            value={formData.room}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Início</Label>
                            <Input
                                id="startTime"
                                name="startTime"
                                type="time"
                                value={formData.startTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Fim</Label>
                            <Input
                                id="endTime"
                                name="endTime"
                                type="time"
                                value={formData.endTime}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={formData.status}
                            onValueChange={(val) => handleSelectChange("status", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="scheduled">Agendado</SelectItem>
                                <SelectItem value="in_progress">Em Andamento</SelectItem>
                                <SelectItem value="completed">Finalizado</SelectItem>
                                <SelectItem value="cancelled">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </CardContent>
            </Card>

            <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancelar
                </Button>
                <Button type="submit">Salvar Agendamento</Button>
            </div>
        </form>
    );
}
