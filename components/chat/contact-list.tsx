"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Search, MoreVertical, MessageSquarePlus, Filter } from "lucide-react";
import { useState } from "react";

export interface Contact {
    id: string;
    name: string;
    avatar?: string;
    lastMessage: string;
    time: string;
    unreadCount?: number;
    active?: boolean;
}

interface ContactListProps {
    contacts: Contact[];
    onSelectContact: (id: string) => void;
    selectedId: string | null;
}

export default function ContactList({ contacts, onSelectContact, selectedId }: ContactListProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full border-r border-[#e9edef] bg-white w-full md:w-[400px]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f0f2f5] border-b border-[#e9edef]">
                <div className="w-10 h-10 overflow-hidden rounded-full bg-slate-300">
                    <Avatar className="w-full h-full">
                        <AvatarImage src="https://github.com/shadcn.png" />
                        <AvatarFallback>EU</AvatarFallback>
                    </Avatar>
                </div>
                <div className="flex items-center gap-5 text-[#54656f]">
                    <button title="Comunidades"><div className="w-6 h-6 border-2 border-current rounded-sm opacity-60" /></button>
                    <button title="Status"><div className="w-5 h-5 border-2 border-current rounded-full opacity-60" /></button>
                    <button title="Novo chat"><MessageSquarePlus className="w-5 h-5" /></button>
                    <button title="Menu"><MoreVertical className="w-5 h-5" /></button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-2 bg-white border-b border-[#e9edef] relative">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-[#54656f]">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    placeholder="Pesquisar ou começar uma nova conversa"
                    className="w-full bg-[#f0f2f5] rounded-lg py-1.5 pl-12 pr-4 text-sm text-[#3b4a54] placeholder:text-[#54656f] focus:outline-none focus:bg-white focus:shadow-sm transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="absolute right-6 top-1/2 -translate-y-1/2 text-[#54656f]">
                    <Filter className="w-4 h-4" />
                </button>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        onClick={() => onSelectContact(contact.id)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-[#f5f6f6] transition-colors border-b border-[#f0f2f5]",
                            selectedId === contact.id ? "bg-[#f0f2f5]" : ""
                        )}
                    >
                        <Avatar className="w-12 h-12">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="bg-slate-200 text-slate-500">{contact.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className="text-[#111b21] font-normal text-[17px] truncate">{contact.name}</h3>
                                <span className={cn(
                                    "text-xs truncate",
                                    contact.unreadCount ? "text-[#00a884] font-semibold" : "text-[#667781]"
                                )}>{contact.time}</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <p className="text-[#3b4a54] text-sm truncate pr-2 flex-1">
                                    {contact.lastMessage}
                                </p>
                                {contact.unreadCount ? (
                                    <span className="bg-[#00a884] text-white text-xs font-medium min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center">
                                        {contact.unreadCount}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
