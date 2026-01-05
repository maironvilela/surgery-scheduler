"use client";

import ChatLayout from "@/components/chat/chat-layout";
import ConnectScreen from "@/components/chat/connect-screen";
import { useEffect, useState } from "react";

export default function ChatPage() {
    const [status, setStatus] = useState<string>('DISCONNECTED');
    const [qrCode, setQrCode] = useState<string | null>(null);

    useEffect(() => {
        // 1. Iniciar o cliente no backend ao montar a página
        const initClient = async () => {
            try {
                await fetch('/api/whatsapp', { method: 'POST' });
            } catch (error) {
                console.error("Failed to start WhatsApp client", error);
            }
        };
        initClient();

        // 2. Polling de status a cada 2 segundos
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/whatsapp');
                const data = await res.json();

                setStatus(data.status);
                setQrCode(data.qrCode);

            } catch (error) {
                console.error("Failed to fetch status", error);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    if (status === 'READY' || status === 'AUTHENTICATED') {
        // Pequeno delay para UX ou exibir estado de 'conectando'
        return <ChatLayout />;
    }

    return <ConnectScreen qrCode={qrCode} status={status} />;
}
