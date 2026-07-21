import { getWhatsappClient, getWhatsappStatus } from "@/lib/whatsapp";

/**
 * Envia um alerta no WhatsApp sempre que houver falha de autenticação.
 * Alvo: (31) 98720-5436 -> +5531987205436
 */
export async function sendAuthFailureAlert(attemptedEmail: string) {
    const rawPhone = "5531987205436";
    const formattedPhone = "+5531987205436";
    const timestamp = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const message = `🚨 *Alerta de Segurança - Falha de Acesso*\n\nIdentificada uma tentativa de login malsucedida no sistema:\n\n• *E-mail tentado*: ${attemptedEmail}\n• *Data/Hora*: ${timestamp}\n• *Motivo*: E-mail ou senha incorretos.\n\n_Daya Gestão Médica_`;

    console.warn(`[Security Alert] Tentativa de login malsucedida para: ${attemptedEmail}`);

    let sent = false;

    // 1. Tenta envio via uTalk API (Umbler)
    const utalkToken = process.env.UTALK_API_TOKEN;
    const utalkOrgId = process.env.UTALK_ORGANIZATION_ID;

    if (utalkToken && utalkOrgId) {
        try {
            const res = await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${utalkToken}`,
                },
                body: JSON.stringify({
                    toPhone: formattedPhone,
                    fromPhone: process.env.UTALK_FROM_PHONE,
                    organizationId: utalkOrgId,
                    message: message,
                    file: null,
                    skipReassign: false,
                    contactName: "Segurança Sistema",
                }),
            });

            if (res.ok) {
                console.log(`[Security Alert] ✅ Alerta uTalk enviado para ${formattedPhone}`);
                sent = true;
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error("[Security Alert] ❌ Erro na API uTalk:", errData);
            }
        } catch (err) {
            console.error("[Security Alert] ❌ Falha na requisição uTalk:", (err as Error).message);
        }
    } else {
        console.warn(
            "[Security Alert] ⚠️ Variáveis UTALK_API_TOKEN / UTALK_ORGANIZATION_ID não configuradas no .env"
        );
    }

    // 2. Tenta envio via WhatsApp Web Local (se o QR Code estiver escaneado e ativo)
    try {
        const { status } = getWhatsappStatus();
        if (status === "READY") {
            const client = getWhatsappClient();
            const chatId = `${rawPhone}@c.us`;
            await client.sendMessage(chatId, message);
            console.log(`[Security Alert] ✅ Alerta WhatsApp Web enviado para ${chatId}`);
            sent = true;
        } else {
            console.warn(
                `[Security Alert] ⚠️ WhatsApp Web local está '${status}' (requer leitura do QR Code na tela /chat)`
            );
        }
    } catch (err) {
        console.error("[Security Alert] ❌ Erro no WhatsApp Web local:", (err as Error).message);
    }

    if (!sent) {
        console.error(
            `[Security Alert] ❌ Alerta para ${attemptedEmail} NÃO pôde ser entregue. É necessário ter os dados da API uTalk no .env/Vercel ou o WhatsApp Web conectado em /chat.`
        );
    }
}
