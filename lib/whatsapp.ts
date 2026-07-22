/**
 * Módulo de integração WhatsApp via uTalk API.
 * As dependências de leitura de QR Code (whatsapp-web.js / Puppeteer) foram removidas.
 */

export const getWhatsappClient = () => undefined;

export const getWhatsappStatus = () => ({
    status: 'READY' as const,
    qrCode: null,
});

export const initializeWhatsapp = async () => {
    // Integração via uTalk é direta por API HTTP (sem necessidade de QR Code)
    return Promise.resolve();
};

export const getChats = async () => {
    return [];
};

export const getMessages = async (_chatId: string) => {
    return [];
};

export const sendMessage = async (toPhone: string, message: string) => {
    const utalkToken = process.env.UTALK_API_TOKEN;
    const utalkOrgId = process.env.UTALK_ORGANIZATION_ID;

    if (!utalkToken || !utalkOrgId) {
        throw new Error("Variáveis UTALK_API_TOKEN e UTALK_ORGANIZATION_ID não configuradas no ambiente.");
    }

    let phone = toPhone.replace(/\D/g, "");
    if (!phone.startsWith("55") && (phone.length === 10 || phone.length === 11)) {
        phone = "55" + phone;
    }
    const formattedPhone = "+" + phone;

    const response = await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
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
            contactName: "Sistema",
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro uTalk (${response.status}): ${JSON.stringify(errorData)}`);
    }

    return { success: true };
};
