import { getWhatsappClient, getWhatsappStatus } from "@/lib/whatsapp";

/**
 * Envia um alerta no WhatsApp sempre que houver falha de autenticação.
 * Alvo: (31) 98720-5436 -> 5531987205436
 */
export async function sendAuthFailureAlert(attemptedEmail: string) {
    const targetPhone = "5531987205436";
    const timestamp = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const message = `🚨 *Alerta de Segurança - Falha de Acesso*\n\nIdentificada uma tentativa de login malsucedida no sistema:\n\n• *E-mail tentado*: ${attemptedEmail}\n• *Data/Hora*: ${timestamp}\n• *Motivo*: E-mail ou senha incorretos.\n\n_Daya Gestão Médica_`;

    console.warn(`[Security Alert] Tentativa de login malsucedida para: ${attemptedEmail}`);

    // 1. Envio via uTalk API (se tokens estiverem presentes no ambiente)
    if (process.env.UTALK_API_TOKEN && process.env.UTALK_ORGANIZATION_ID) {
        try {
            await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.UTALK_API_TOKEN}`,
                },
                body: JSON.stringify({
                    toPhone: targetPhone,
                    fromPhone: process.env.UTALK_FROM_PHONE,
                    organizationId: process.env.UTALK_ORGANIZATION_ID,
                    message: message,
                    file: null,
                    skipReassign: false,
                    contactName: "Segurança Sistema",
                }),
            });
            console.log(`[Security Alert] Alerta enviado via uTalk para ${targetPhone}`);
        } catch (err) {
            console.error("[Security Alert] Erro ao enviar uTalk:", (err as Error).message);
        }
    }

    // 2. Envio via WhatsApp Web Local (se o QR Code estiver conectado)
    try {
        const { status } = getWhatsappStatus();
        if (status === "READY") {
            const client = getWhatsappClient();
            const chatId = `${targetPhone}@c.us`;
            await client.sendMessage(chatId, message);
            console.log(`[Security Alert] Alerta enviado via WhatsApp Web para ${chatId}`);
        }
    } catch (err) {
        console.error("[Security Alert] Erro ao enviar WhatsApp Web:", (err as Error).message);
    }
}
