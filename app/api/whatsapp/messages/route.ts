import { NextResponse } from 'next/server';
import { getMessages, sendMessage } from '@/lib/whatsapp';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
        return NextResponse.json({ error: 'Chat ID required' }, { status: 400 });
    }

    const messages = await getMessages(chatId);
    return NextResponse.json(messages);
}

export async function POST(request: Request) {
    const body = await request.json();
    const { chatId, message } = body;

    if (!chatId || !message) {
        return NextResponse.json({ error: 'Chat ID and message required' }, { status: 400 });
    }

    try {
        await sendMessage(chatId, message);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
