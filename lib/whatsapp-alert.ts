/**
 * Envia um alerta no WhatsApp sempre que houver falha de autenticação via API uTalk.
 * Alvo: (31) 98720-5436 -> +5531987205436
 */
export async function sendAuthFailureAlert(attemptedEmail: string) {
    const formattedPhone = "+5531987205436";
    const timestamp = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const message = `🚨 *Alerta de Segurança - Falha de Acesso*\n\nIdentificada uma tentativa de login malsucedida no sistema:\n\n• *E-mail tentado*: ${attemptedEmail}\n• *Data/Hora*: ${timestamp}\n• *Motivo*: E-mail ou senha incorretos.\n\n_Daya Gestão Médica_`;

    console.warn(`[Security Alert] Tentativa de login malsucedida para: ${attemptedEmail}`);

    const utalkToken = process.env.UTALK_API_TOKEN;
    const utalkOrgId = process.env.UTALK_ORGANIZATION_ID;

    if (!utalkToken || !utalkOrgId) {
        console.warn(
            "[Security Alert] ⚠️ Variáveis UTALK_API_TOKEN / UTALK_ORGANIZATION_ID não estão configuradas no ambiente (.env / Vercel)."
        );
        return;
    }

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
            console.log(`[Security Alert] ✅ Alerta uTalk enviado com sucesso para ${formattedPhone}`);
        } else {
            const errData = await res.json().catch(() => ({}));
            console.error("[Security Alert] ❌ Erro na API do uTalk:", errData);
        }
    } catch (err) {
        console.error("[Security Alert] ❌ Falha de rede ao conectar com uTalk:", (err as Error).message);
    }
}
