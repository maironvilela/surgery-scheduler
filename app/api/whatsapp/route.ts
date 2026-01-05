import { NextResponse } from 'next/server';
import { getWhatsappStatus, initializeWhatsapp } from '@/lib/whatsapp';

export async function GET() {
    const status = getWhatsappStatus();
    return NextResponse.json(status);
}

export async function POST() {
    await initializeWhatsapp();
    return NextResponse.json({ message: 'Initialization started' });
}
