import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { toPhone, message, contactName } = body;

        if (!toPhone || !message) {
            return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 });
        }

        const payload = {
            toPhone: toPhone, // Assuming format is correct, or should I enforce +55? User example has +55
            fromPhone: process.env.UTALK_FROM_PHONE,
            organizationId: process.env.UTALK_ORGANIZATION_ID,
            message: message,
            file: null,
            skipReassign: false,
            contactName: contactName || "Paciente"
        };

        const response = await fetch("https://app-utalk.umbler.com/api/v1/messages/simplified/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.UTALK_API_TOKEN}`
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
