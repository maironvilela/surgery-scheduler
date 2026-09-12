import { NextResponse } from 'next/server';
import { getDoctorSenderPhone, getDoctorTagId } from '@/lib/constants/scheduling';

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
        // Extract chat ID and contact ID from uTalk response
        const chatId = data?.chatId || data?.chat?.id || data?.chat;
        const contactId = data?.contactId || data?.contact?.id || data?.chat?.contactId || data?.chat?.contact;

        // ID da Tag de confirmação de consulta no uTalk (padrão: UTALK_TAG_CONFIRMAR_CONSULTA / EE2DD9391D2C44568064)
        const CHAT_TAG_ID = customTagId || process.env.UTALK_TAG_CONFIRMAR_CONSULTA || process.env.UTALK_TAG_CONFIRMAR || "apCBYzdOOoCHceOO";
        let taggedChat = false;
        let taggedContact = false;

        // 1. Aplicar Tag no Chat (Consulta Agendada / Confirmar)
        if (chatId) {
            try {
                const tagRes = await fetch(`https://app-utalk.umbler.com/api/v1/chats/${chatId}/tags/?organizationId=${utalkOrgId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${utalkToken}`
                    },
                    body: JSON.stringify({
                        tagId: CHAT_TAG_ID,
                        organizationId: utalkOrgId
                    })
                });

                if (tagRes.ok) {
                    taggedChat = true;
                    console.log(`[uTalk] ✅ Tag ${CHAT_TAG_ID} adicionada ao chat ${chatId}`);
                } else {
                    const tagErr = await tagRes.json().catch(() => ({}));
                    if (tagErr?.errors?.TagId?.some((msg: string) => msg.includes("já contém essa tag"))) {
                        taggedChat = true;
                        console.log(`[uTalk] ℹ️ Chat ${chatId} já possuía a tag ${CHAT_TAG_ID}`);
                    } else {
                        console.warn(`[uTalk] ⚠️ Aviso ao adicionar tag ao chat ${chatId}:`, JSON.stringify(tagErr));
                    }
                }
            } catch (tagException: any) {
                console.error("[uTalk] Erro ao chamar API de tag de chat:", tagException);
            }
        }

        // 2. Aplicar Tag do Médico no Contato do Paciente (v1/contacts/{contactId}/tags)
        const doctorTagId = doctorName ? getDoctorTagId(doctorName) : null;
        if (contactId && doctorTagId) {
            try {
                const contactTagRes = await fetch(`https://app-utalk.umbler.com/api/v1/contacts/${contactId}/tags/?organizationId=${utalkOrgId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${utalkToken}`
                    },
                    body: JSON.stringify({
                        tagId: doctorTagId,
                        organizationId: utalkOrgId
                    })
                });

                if (contactTagRes.ok) {
                    taggedContact = true;
                    console.log(`[uTalk] ✅ Tag do médico (${doctorTagId}) adicionada ao contato ${contactId} (${doctorName})`);
                } else {
                    const contactErr = await contactTagRes.json().catch(() => ({}));
                    if (contactErr?.errors?.TagId?.some((msg: string) => msg.includes("já contém essa tag"))) {
                        taggedContact = true;
                        console.log(`[uTalk] ℹ️ Contato ${contactId} já possuía a tag do médico ${doctorTagId}`);
                    } else {
                        console.warn(`[uTalk] ⚠️ Aviso ao adicionar tag do médico ao contato ${contactId}:`, JSON.stringify(contactErr));
                    }
                }
            } catch (contactTagException: any) {
                console.error("[uTalk] Erro ao chamar API de tag no contato:", contactTagException);
            }
        }

        return NextResponse.json({
            success: true,
            data,
            tagged: taggedChat,
            taggedContact,
            chatId,
            contactId
        });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 });
    }
}
