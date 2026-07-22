/**
 * Envia um alerta no WhatsApp sempre que houver falha ou sucesso de autenticação via API uTalk.
 * Alvo: (31) 98720-5436 -> +5531987205436
 */
const TARGET_PHONE = "+5531987205436";

const DEFAULT_UTALK_TOKEN = "Teste-2026-01-13-2094-02-01--E1663E54181A9EB56AA95A0389AF29F38EE4480E4F6454C33E38672BEE155953";
const DEFAULT_UTALK_ORG_ID = "aUPnlGY0VXoPxraR";
const DEFAULT_UTALK_FROM_PHONE = "+5531971041077=";

async function sendUTalkMessage(message: string, contactName: string) {
    const utalkToken = process.env.UTALK_API_TOKEN || DEFAULT_UTALK_TOKEN;
    const utalkOrgId = process.env.UTALK_ORGANIZATION_ID || DEFAULT_UTALK_ORG_ID;
    const utalkFromPhone = process.env.UTALK_FROM_PHONE || DEFAULT_UTALK_FROM_PHONE;

    try {
        const res = await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${utalkToken}`,
            },
            body: JSON.stringify({
                toPhone: TARGET_PHONE,
                fromPhone: utalkFromPhone,
                organizationId: utalkOrgId,
                message: message,
                file: null,
                skipReassign: false,
                contactName: contactName,
            }),
        });

        if (res.ok) {
            console.log(`[Auth Notification] ✅ Mensagem uTalk enviada com sucesso para ${TARGET_PHONE}`);
        } else {
            const errData = await res.json().catch(() => ({}));
            console.error("[Auth Notification] ❌ Erro na API do uTalk:", errData);
        }
    } catch (err) {
        console.error("[Auth Notification] ❌ Falha de rede ao conectar com uTalk:", (err as Error).message);
    }
}

/**
 * Envia notificação quando houver falha de autenticação.
 */
export async function sendAuthFailureAlert(attemptedEmail: string) {
    const timestamp = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const message = `🚨 *Alerta de Segurança - Falha de Acesso*\n\nIdentificada uma tentativa de login malsucedida no sistema:\n\n• *E-mail tentado*: ${attemptedEmail}\n• *Data/Hora*: ${timestamp}\n• *Motivo*: E-mail ou senha incorretos.\n\n_Daya Gestão Médica_`;

    console.warn(`[Security Alert] Tentativa de login malsucedida para: ${attemptedEmail}`);
    await sendUTalkMessage(message, "Segurança Sistema");
}

/**
 * Envia notificação quando o login for realizado com sucesso.
 */
export async function sendAuthSuccessAlert(userEmail: string, userName: string) {
    const timestamp = new Date().toLocaleString("pt-BR", {
        timeZone: "America/Sao_Paulo",
    });

    const message = `✅ *Notificação de Acesso - Login Realizado*\n\nUm usuário acabou de se autenticar com sucesso no sistema:\n\n• *Nome*: ${userName}\n• *E-mail*: ${userEmail}\n• *Data/Hora*: ${timestamp}\n\n_Daya Gestão Médica_`;

    console.log(`[Auth Notification] Login bem-sucedido para: ${userName} (${userEmail})`);
    await sendUTalkMessage(message, "Notificação de Acesso");
}
