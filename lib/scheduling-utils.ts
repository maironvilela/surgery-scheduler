import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DOCTORS_MAPPING, LOCATIONS_MAPPING } from "./constants/scheduling";

/**
 * Sanitizes phone numbers by removing non-digits and ensuring 55 country code.
 * Validates number length between 10 and 13 digits.
 */
export function sanitizePhoneNumber(phone: string): { clean: string; formatted: string; isValid: boolean } {
    let clean = phone.replace(/\D/g, "");

    // Prepend Brazil country code (55) if not present
    if (clean.length === 10 || clean.length === 11) {
        clean = "55" + clean;
    }

    const isValid = clean.length >= 10 && clean.length <= 13;

    // Formatted presentation: +55 (31) 98765-4321
    let formatted = phone;
    if (clean.startsWith("55") && clean.length >= 12) {
        const ddd = clean.substring(2, 4);
        const number = clean.substring(4);
        if (number.length === 9) {
            formatted = `+55 (${ddd}) ${number.substring(0, 5)}-${number.substring(5)}`;
        } else if (number.length === 8) {
            formatted = `+55 (${ddd}) ${number.substring(0, 4)}-${number.substring(4)}`;
        }
    }

    return { clean, formatted, isValid };
}

/**
 * Capitalizes Portuguese day of week: "segunda-feira" -> "Segunda-Feira"
 */
function capitalizeWeekDay(dayStr: string): string {
    return dayStr
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-");
}

/**
 * Converts YYYY-MM-DD and HH:mm to full Portuguese extended date string
 * Example: "31 de agosto de 2026, Segunda-Feira"
 */
export function formatFullExtendedDate(dateStr: string, timeStr: string): string {
    if (!dateStr) return "";

    try {
        const [year, month, day] = dateStr.split("-").map(Number);
        const dateObj = new Date(year, month - 1, day);

        const dayAndMonthYear = format(dateObj, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
        const rawWeekDay = format(dateObj, "EEEE", { locale: ptBR });
        const weekDayFormatted = capitalizeWeekDay(rawWeekDay);

        return `${dayAndMonthYear}, ${weekDayFormatted}, às ${timeStr}`;
    } catch {
        return `${dateStr} às ${timeStr}`;
    }
}

/**
 * Builds the exact standardized WhatsApp appointment message according to specification.
 */
export function buildWhatsAppMessage(params: {
    patientName: string;
    doctorName: string;
    specialty: string;
    dateStr: string;
    timeStr: string;
    locationName: string;
    locationAddress: string;
}): { fullDatetimeString: string; message: string } {
    const { patientName, doctorName, specialty, dateStr, timeStr, locationName, locationAddress } = params;

    // Check doctor treatment (⚕️ Médico vs ⚕️ Médica)
    const doctorObj = DOCTORS_MAPPING.find((d) => d.name === doctorName);
    const doctorLabel = doctorObj ? doctorObj.treatment : doctorName.startsWith("Dra.") ? "⚕️ Médica" : "⚕️ Médico";

    const fullDatetimeString = formatFullExtendedDate(dateStr, timeStr);

    const message = `✅ Consulta Agendada com Sucesso!

Olá, ${patientName}! Seguem os detalhes do seu atendimento:

👤 Paciente: ${patientName}
${doctorLabel}: ${doctorName}
🩺 Especialidade: ${specialty}

📅 Data e Horário: ${fullDatetimeString}
🏥 Local: ${locationName}
📍 Endereço: ${locationAddress}

Ficamos muito felizes em poder cuidar de você! Qualquer dúvida sobre o trajeto ou documentação, estamos à disposição por aqui. 💙😊`;

    return { fullDatetimeString, message };
}

/**
 * Generates WhatsApp web/mobile deep link
 */
export function buildWhatsAppDeepLink(phone: string, message: string): string {
    const { clean } = sanitizePhoneNumber(phone);
    return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
