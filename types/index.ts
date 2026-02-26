export interface Patient {
    id: string;
    name: string;
    insurance: string; // Convênio
    plan: string; // Plano
    birthDate: string; // Data de nascimento
    gender: 'male' | 'female' | 'other'; // Genero
    // Address Fields
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string; // filled via API
    state: string; // filled via API
    phone: string; // Contatos (Phone)
    email?: string; // Contatos (Email - optional)
    createdAt: string;
}

export interface Doctor {
    id: string;
    crm: string;
    name: string;
    specialty: string;
    photoUrl?: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

export interface HospitalContact {
    id: string;
    type: 'phone' | 'email';
    value: string;
    label?: string; // e.g. "Comercial", "Financeiro"
    isPrimary: boolean;
}

export interface Hospital {
    id: string;
    name: string;
    // Address Fields
    cep: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    referencePoint: string; // Ponto de referência
    contacts: HospitalContact[];
    createdAt: string;
}

export type SurgeryStatus = 'scheduled' | 'completed' | 'cancelled' | 'in_progress';

export interface Surgery {
    id: string;
    patientId: string;
    patientName: string; // Denormalized for display if needed, or just use context lookup. I'll include it for easier mock display.
    doctorId: string;
    doctorName: string;
    hospitalId: string;
    hospitalName: string;
    procedure: string;
    date: string; // ISO Date or YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string; // HH:mm
    room: string;
    status: SurgeryStatus;
    notes?: string;
    comments?: Comment[];
    createdAt: string;
}

export interface Comment {
    id: string;
    user: string;
    date: string;
    content: string;
}

export interface ProcedureReport {
    id: string;
    user: string;
    avatar?: string;
    content: string;
    date: string;
}

export interface Procedure {
    id: string;
    reports?: ProcedureReport[];
    // Identification
    code: string;
    name: string;
    specialty: string;

    // Pre-Operative
    fastingTime: string; // Tempo de jejum

    // Operation
    estimatedDuration: string; // Tempo Estimado de Duração
    anesthesiaType: 'Geral' | 'Local' | 'Raqui' | 'Sedação' | string;
    equipment: string; // Equipamentos Necessários
    materials: string; // Materiais e OPME
    bloodRequirement: string; // Necessidade de Sangue
    teamSize: string; // Equipe Mínima sugerida

    // Post-Operative
    recoveryTimePACU: string; // Tempo de Recuperação Pós-Anestésica (RPA)
    recoveryTimeICU: string; // Tempo de Recuperação UTI
    hospitalizationTime: string; // Tempo de Internação
    homeRecoveryTime: string; // Tempo de Recuperação Domiciliar
    suggestedCertificateTime: string; // Tempo de Atestado sugerido

    // Documentation
    consentForm: boolean; // Termo de Consentimento

    createdAt: string;
    updatedAt: string;
}

export interface ConsultationItem {
    id: string;
    patientName: string;
    phone?: string;
    status: string;
    time: string;
    date: string; // ISO string or YYYY-MM-DD
    whatsappSent?: boolean;
    isArchived?: boolean;
    doctorId?: string;
    hospitalId?: string;
    insurance?: string;
    observations?: string;
}
