import { NextResponse } from 'next/server';
import { getChats } from '@/lib/whatsapp';

export async function GET() {
    const chats = await getChats();
    return NextResponse.json(chats);
}
