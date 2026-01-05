"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Paperclip, Search, Send, Smile, MoreVertical, Phone, Video } from "lucide-react";
import { useState } from "react";
import { Contact } from "./contact-list";

interface ChatWindowProps {
    contact: Contact;
    onSendMessage: (text: string) => void;
    messages: Array<{ id: string; text: string; sender: "me" | "them"; time: string; status?: "sent" | "delivered" | "read" }>;
}

export default function ChatWindow({ contact, onSendMessage, messages }: ChatWindowProps) {
    const [inputText, setInputText] = useState("");

    const handleSend = () => {
        if (inputText.trim()) {
            onSendMessage(inputText);
            setInputText("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#efeae2] relative w-full">
            {/* Background Pattern */}
            <div
                className="absolute inset-0 z-0 opacity-40 pointer-events-none"
                style={{
                    backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')",
                    backgroundRepeat: "repeat"
                }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#e9edef]">
                <div className="flex items-center gap-4 cursor-pointer">
                    <Avatar>
                        <AvatarImage src={contact.avatar} />
                        <AvatarFallback className="bg-slate-200">{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col justify-center">
                        <span className="text-[#111b21] font-normal text-md leading-tight">{contact.name}</span>
                        <span className="text-[#54656f] text-xs leading-tight">visto por último hoje às {contact.time}</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 text-[#54656f]">
                    <button title="Pesquisar"><Search className="w-5 h-5 opacity-60" /></button>
                    <button title="Mais opções"><MoreVertical className="w-5 h-5 opacity-60" /></button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-9 space-y-2 custom-scrollbar">
                {/* Encryption Notice */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#ffeecd] text-[#54656f] text-xs px-3 py-1.5 rounded-lg shadow-sm text-center max-w-[90%] md:max-w-[60%] flex gap-1 items-center justify-center">
                        <span className="text-[10px]">🔒</span> As mensagens são protegidas com a criptografia de ponta a ponta. Ninguém fora desse chat, nem mesmo o WhatsApp, pode ler ou ouvir.
                    </div>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex w-full ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                    >
                        <div className={`
                    relative max-w-[65%] md:max-w-[50%] px-3 py-1.5 rounded-lg shadow-sm text-sm
                    ${msg.sender === "me" ? "bg-[#d9fdd3] rounded-tr-none" : "bg-white rounded-tl-none"}
                 `}>
                            <div className="text-[#111b21] pb-1">{msg.text}</div>
                            <div className="flex justify-end items-center gap-1">
                                <span className="text-[11px] text-[#667781] block text-right leading-none relative top-[2px]">{msg.time}</span>
                                {msg.sender === "me" && (
                                    <span className={`text-[15px] ${msg.status === "read" ? "text-[#53bdeb]" : "text-[#667781]"}`}>
                                        {/* Double check simulation */}
                                        ✓✓
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <div className="relative z-10 bg-[#f0f2f5] px-4 py-2 flex items-center gap-3 min-h-[62px]">
                <div className="flex gap-3 text-[#54656f]">
                    <button><Smile className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                    <button><Paperclip className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                </div>

                <div className="flex-1 bg-white rounded-lg flex items-center">
                    <input
                        type="text"
                        className="w-full px-4 py-2.5 rounded-lg focus:outline-none text-[#3b4a54] placeholder:text-[#54656f] text-[15px]"
                        placeholder="Mensagem"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                </div>

                <div className="text-[#54656f]">
                    {inputText.trim() ? (
                        <button onClick={handleSend}><Send className="w-6 h-6 text-[#54656f]" /></button>
                    ) : (
                        <button><Mic className="w-6 h-6 opacity-60 hover:opacity-100" /></button>
                    )}
                </div>
            </div>
        </div>
    );
}
