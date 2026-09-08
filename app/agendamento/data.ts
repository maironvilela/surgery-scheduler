export interface PatientSourceOption {
    id: string;
    label: string;
    icon: string;
    badgeColorClass: string;
    buttonColorClass: string;
}

export interface DoctorPriceOption {
    doctor: string;
    prices: {
        label: string;
        amount: string;
    }[];
}

export interface AgendamentoTab {
    value: string;
    label: string;
}

export const AGENDAMENTO_PAGE_CONFIG = {
    title: "Agendamento de Consultas",
    description: "Cadastre agendamentos, gere mensagens formatadas e acompanhe o histórico de agendamentos.",
    refreshButtonText: "Atualizar Lista",
};

export const AGENDAMENTO_TABS: AgendamentoTab[] = [
    { value: "agendamento", label: "Agendamento" },
    { value: "todos", label: "Todos os Agendamentos" },
];

export const AGENDAMENTO_TABLE_CONFIG = {
    cardTitle: "Agendamentos Cadastrados",
    cardDescription: "Histórico completo de agendamentos gravados no sistema.",
    searchPlaceholder: "Buscar por paciente, tel, atendente...",
    loadingText: "Carregando agendamentos...",
    emptyText: "Nenhum agendamento encontrado.",
    headers: [
        "Paciente",
        "Telefone",
        "Médico & Local",
        "Data da Consulta",
        "Realizado em",
        "Usuário Responsável",
        "Ações",
    ],
};

export const PATIENT_SOURCES: PatientSourceOption[] = [
    {
        id: "Paciente",
        label: "Paciente",
        icon: "👤",
        badgeColorClass: "",
        buttonColorClass: "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold",
    },
    {
        id: "Site",
        label: "Veio do Site",
        icon: "🌐",
        badgeColorClass: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
        buttonColorClass: "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-950/60 dark:border-blue-500 dark:text-blue-300 shadow-xs font-bold",
    },
    {
        id: "Doctoralia",
        label: "Doctoralia",
        icon: "🩺",
        badgeColorClass: "bg-teal-50 text-teal-700 border-teal-200 font-semibold",
        buttonColorClass: "bg-teal-50 border-teal-500 text-teal-700 dark:bg-teal-950/60 dark:border-teal-500 dark:text-teal-300 shadow-xs font-bold",
    },
    {
        id: "Instagram",
        label: "Instagram",
        icon: "📸",
        badgeColorClass: "bg-pink-50 text-pink-700 border-pink-200 font-semibold",
        buttonColorClass: "bg-pink-50 border-pink-500 text-pink-700 dark:bg-pink-950/60 dark:border-pink-500 dark:text-pink-300 shadow-xs font-bold",
    },
];

export const DOCTOR_PRICES: DoctorPriceOption[] = [
    {
        doctor: "Dr. Jader",
        prices: [
            { label: "Presencial", amount: "650,00" },
            { label: "On-line", amount: "800,00" },
        ],
    },
    {
        doctor: "Dr. Sávio",
        prices: [
            { label: "Presencial", amount: "850,00" },
        ],
    },
    {
        doctor: "Dra. Iara",
        prices: [
            { label: "1º Consulta", amount: "600,00" },
            { label: "Para pacientes", amount: "450,00" },
            { label: "Paciente SUS", amount: "350,00" },
        ],
    },
    {
        doctor: "Dr. Tiago",
        prices: [
            { label: "Presencial", amount: "600,00" },
            { label: "On-line", amount: "600,00" },
        ],
    },
    {
        doctor: "Dr. Rômulo",
        prices: [
            { label: "Numai", amount: "350,00" },
            { label: "Centra", amount: "350,00" },
            { label: "Biocor", amount: "550,00" },
        ],
    },
];
