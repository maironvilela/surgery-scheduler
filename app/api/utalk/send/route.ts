import { NextResponse } from 'next/server';
import { getDoctorSenderPhone } from '@/lib/constants/scheduling';

const DEFAULT_UTALK_TOKEN = "Teste-2026-01-13-2094-02-01--E1663E54181A9EB56AA95A0389AF29F38EE4480E4F6454C33E38672BEE155953";
const DEFAULT_UTALK_ORG_ID = "aUPnlGY0VXoPxraR";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { toPhone, message, contactName, doctorName, fromPhone, tagId: customTagId } = body;

        if (!toPhone || !message) {
            return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 });
        }

        const utalkToken = process.env.UTALK_API_TOKEN || DEFAULT_UTALK_TOKEN;
        const utalkOrgId = process.env.UTALK_ORGANIZATION_ID || DEFAULT_UTALK_ORG_ID;

        // Determine specific sender phone based on selected doctor
        const utalkFromPhone = fromPhone || (doctorName ? getDoctorSenderPhone(doctorName) : (process.env.UTALK_FROM_PHONE || "+5531971041077="));

        const payload = {
            toPhone: toPhone,
            fromPhone: utalkFromPhone,
            organizationId: utalkOrgId,
            message: message,
            file: null,
            skipReassign: false,
            contactName: contactName || "Paciente"
        };


        const response = await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${utalkToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("Utalk API Error:", errorData);
            return NextResponse.json({ error: 'Erro ao enviar mensagem via Utalk', details: errorData }, { status: response.status });
        }

        const data = await response.json();
        // Extract chat ID from uTalk simplified message response
        const chatId = data?.chatId || data?.chat?.id || data?.chat;
        // ID da Tag de confirmação de consulta no uTalk (padrão: UTALK_TAG_CONFIRMAR_CONSULTA)
        const TAG_ID = customTagId || process.env.UTALK_TAG_CONFIRMAR_CONSULTA || process.env.UTALK_TAG_CONSULTA_AGENDADA || "apCBYzdOOoCHceOO";
        let tagged = false;

        if (chatId) {
            try {
                // Adicionar tag ao chat no uTalk
                const tagRes = await fetch(`https://app-utalk.umbler.com/api/v1/chats/${chatId}/tags/?organizationId=${utalkOrgId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${utalkToken}`
                    },
                    body: JSON.stringify({
                        tagId: TAG_ID,
                        organizationId: utalkOrgId
                    })
                });

                if (tagRes.ok) {
                    tagged = true;
                    console.log(`[uTalk] ✅ Tag ${TAG_ID} ("CONSULTA AGENDADA") adicionada com sucesso ao chat ${chatId}`);
                } else {
                    const tagErr = await tagRes.json().catch(() => ({}));
                    if (tagErr?.errors?.TagId?.some((msg: string) => msg.includes("já contém essa tag"))) {
                        tagged = true;
                        console.log(`[uTalk] ℹ️ Chat ${chatId} já possuía a tag ${TAG_ID}`);
                    } else {
                        console.warn(`[uTalk] ⚠️ Aviso ao adicionar tag ao chat ${chatId}:`, JSON.stringify(tagErr));
                    }
                }
            } catch (tagException: any) {
                console.error("[uTalk] Erro ao chamar API de adição de tag:", tagException);
            }
        } else {
            console.warn("[uTalk] Resposta da API de mensagem não retornou chatId:", data);
        }

        return NextResponse.json({ success: true, data, tagged });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 });
    }
}
