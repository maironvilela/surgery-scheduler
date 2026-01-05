"use client";


import { useState, useEffect } from "react";
import ContactList, { Contact } from "./contact-list";
import ChatWindow from "./chat-window";
import { Lock } from "lucide-react";

export default function ChatLayout() {
    const [activeContactId, setActiveContactId] = useState<string | null>(null);
    const [contacts, setContacts] = useState<Contact[]>([]);

    // Local state for messages to allow sending
    // For now, we still Mock messages when opening a chat because we haven't implemented message fetching yet
    const [messages, setMessages] = useState<Record<string, Array<any>>>({});

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const res = await fetch('/api/whatsapp/chats');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setContacts(data);
                }
            } catch (error) {
                console.error("Failed to fetch chats", error);
            }
        };
        fetchChats();
    }, []);

    const activeContact = activeContactId ? contacts.find(c => c.id === activeContactId) : null;
    const activeMessages = activeContactId ? (messages[activeContactId] || []) : [];

    // Fetch messages when active contact changes
    useEffect(() => {
        if (!activeContactId) return;

        const fetchMessages = async () => {
            try {
                // Optimistic clear or keep old? WhatsApp usually keeps old until loaded. 
                // We'll just fetch and replace for now.
                const res = await fetch(`/api/whatsapp/messages?chatId=${activeContactId}`);
                const data = await res.json();

                if (Array.isArray(data)) {
                    // Sort by time if needed, but usually comes sorted from lib
                    setMessages(prev => ({
                        ...prev,
                        [activeContactId]: data
                    }));
                }
            } catch (error) {
                console.error("Failed to fetch messages", error);
            }
        };
        fetchMessages();

        // Polling for new messages every 3s (simple implementation)
        const interval = setInterval(fetchMessages, 3000);
        return () => clearInterval(interval);

    }, [activeContactId]);

    const handleSendMessage = async (text: string) => {
        if (!activeContactId) return;

        // Optimistic UI Update
        const tempId = Date.now().toString();
        const newMessage = {
            id: tempId,
            text,
            sender: "me" as const,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sent" as const
        };

        setMessages(prev => ({
            ...prev,
            [activeContactId]: [...(prev[activeContactId] || []), newMessage]
        }));

        // Send to API
        try {
            await fetch('/api/whatsapp/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId: activeContactId, message: text })
            });
            // Could update status to delivered here if we got confirmation
        } catch (error) {
            console.error("Failed to send message", error);
            // Could show error state
        }

        // Update last message in contact list
        setContacts(prev => prev.map(c =>
            c.id === activeContactId
                ? { ...c, lastMessage: text, time: newMessage.time }
                : c
        ));
    };


    return (
        <div className="flex h-screen bg-[#d1d7db] w-full overflow-hidden absolute top-0 left-0 z-50">
            <div className="flex w-full h-full max-w-[1600px] mx-auto bg-white shadow-lg overflow-hidden xl:my-5 xl:h-[calc(100vh-40px)] xl:rounded-lg xl:shadow-lg">

                {/* Left Side: Contact List */}
                <div className={`w-full md:w-[400px] flex-none ${activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    <ContactList
                        contacts={contacts}
                        onSelectContact={setActiveContactId}
                        selectedId={activeContactId}
                    />
                </div>

                {/* Right Side: Chat Window */}
                <div className={`flex-1 bg-[#f0f2f5] border-l border-[#e9edef] ${!activeContactId ? 'hidden md:flex' : 'flex'}`}>
                    {activeContact ? (
                        <ChatWindow
                            contact={activeContact}
                            messages={activeMessages}
                            onSendMessage={handleSendMessage}
                        />
                    ) : (
                        /* Empty State */
                        <div className="w-full h-full flex flex-col items-center justify-center bg-[#f0f2f5] border-b-[6px] border-[#25d366]">
                            <div className="max-w-[560px] text-center px-4">
                                <div className="relative mb-10">
                                    <div className="w-[300px] h-[200px] mx-auto bg-[url('https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae.svg')] bg-contain bg-no-repeat bg-center opacity-60"></div>
                                </div>
                                <h1 className="text-[#41525d] text-3xl font-light mb-5">WhatsApp no PC</h1>
                                <p className="text-[#667781] text-sm leading-6 mb-8">
                                    Envie e receba mensagens sem precisar manter seu celular conectado.<br />
                                    Use o WhatsApp em até 4 parelhos e 1 celular ao mesmo tempo.
                                </p>
                                <div className="absolute bottom-10 flex items-center justify-center gap-2 text-[#8696a0] text-xs">
                                    <Lock className="w-3 h-3" />
                                    <span>Protegido com a criptografia de ponta a ponta</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Green Background Strip for Desktop Look */}
            <div className="fixed top-0 left-0 w-full h-[127px] bg-[#00a884] -z-10 hidden xl:block"></div>
        </div>
    );
}
