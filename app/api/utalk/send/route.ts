import { NextResponse } from 'next/server';

const DEFAULT_UTALK_TOKEN = "Teste-2026-01-13-2094-02-01--E1663E54181A9EB56AA95A0389AF29F38EE4480E4F6454C33E38672BEE155953";
const DEFAULT_UTALK_ORG_ID = "aUPnlGY0VXoPxraR";
const DEFAULT_UTALK_FROM_PHONE = "+5531971041077=";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { toPhone, message, contactName } = body;

        if (!toPhone || !message) {
            return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 });
        }

        const utalkToken = process.env.UTALK_API_TOKEN || DEFAULT_UTALK_TOKEN;
        const utalkOrgId = process.env.UTALK_ORGANIZATION_ID || DEFAULT_UTALK_ORG_ID;
        const utalkFromPhone = process.env.UTALK_FROM_PHONE || DEFAULT_UTALK_FROM_PHONE;

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
        return NextResponse.json({ success: true, data });

    } catch (error) {
        console.error("Internal Server Error:", error);
        return NextResponse.json({ error: 'Erro interno ao processar requisição' }, { status: 500 });
    }
}
