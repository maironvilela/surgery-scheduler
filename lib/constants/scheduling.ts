export interface DoctorMapping {
    name: string;
    specialty: string;
    treatment: string; // "⚕️ Médico" | "⚕️ Médica"
}

export interface LocationMapping {
    name: string;
    address: string;
}

export const DOCTORS_MAPPING: DoctorMapping[] = [
    {
        name: "Dr. Rômulo Oliveira",
        specialty: "Ortopedia (Especialista em Coluna)",
        treatment: "⚕️ Médico"
    },
    {
        name: "Dr. Sávio Laborne",
        specialty: "Ortopedia (Especialista em Coluna)",
        treatment: "⚕️ Médico"
    },
    {
        name: "Dr. Jader de Andrade",
        specialty: "Ortopedia (Especialista em Coluna)",
        treatment: "⚕️ Médico"
    },
    {
        name: "Dr. Tiago Falci",
        specialty: "Ortopedia (Especialista em Coluna)",
        treatment: "⚕️ Médico"
    },
    {
        name: "Dra. Iara Fernandes",
        specialty: "Reumatologia",
        treatment: "⚕️ Médica"
    }
];

export const LOCATIONS_MAPPING: LocationMapping[] = [
    {
        name: "Clínica CEOT",
        address: "Rua São Paulo, 1818, Lourdes - BH/MG"
    },
    {
        name: "Ambulatório Mater Dei Contorno",
        address: "Avenida do Contorno, 9000, 19º Andar - Barro Preto - BH/MG"
    },
    {
        name: "Mais Saúde Santo Agostinho",
        address: "Rua Bernardo Guimarães, 2785 - Santo Agostinho - BH/MG"
    },
    {
        name: "Centro Médico Mater Dei - Nova Lima",
        address: "Alameda Oscar Niemeyer, 61 - Vila da Serra, Nova Lima - MG"
    },
    {
        name: "Ambulatório Mater Dei Betim",
        address: "Via Expressa de Betim, 15500, Duque de Caxias - Betim/MG"
    },
    {
        name: "Clínica Numai",
        address: "Avenida Coronel José Dias Bicalho, 928 - São Luiz/Pampulha - Belo Horizonte/MG"
    },
    {
        name: "Clínica Centra",
        address: "Rua Inconfidência, 488 - 3° andar, Sala 301 - Centro de Betim/MG"
    },
    {
        name: "Clínica Clinorto",
        address: "Av. Contorno, 5057 - Serra - BH/MG"
    },
    {
        name: "Clínica Elcenter Barreiro",
        address: "Rua Alcindo Vieira, 305 - Barreiro - Belo Horizonte/MG"
    },
    {
        name: "CEOFE - Contagem",
        address: "Av. José Faria da Rocha, 4458 - Eldorado, Contagem/MG"
    },
    {
        name: "Biocor - Rede D'Or",
        address: "R. da Paisagem, 290 - Vila da Serra, Nova Lima/MG"
    }
];
