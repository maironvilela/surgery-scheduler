import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

// Global variable to store the client instance in development
// to prevent multiple instances during hot reload
declare global {
    var whatsappClient: Client | undefined;
    var whatsappState: {
        qrCodeData: string | null;
        status: 'DISCONNECTED' | 'QR_READY' | 'AUTHENTICATED' | 'READY';
    } | undefined;
}

let client: Client;

// Initialize global state if needed
if (!global.whatsappState) {
    global.whatsappState = {
        qrCodeData: null,
        status: 'DISCONNECTED'
    };
}

const state = global.whatsappState!;

if (process.env.NODE_ENV === 'production') {
    client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        },
        webVersionCache: {
            type: 'remote',
            remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
        }
    });
} else {
    if (!global.whatsappClient) {
        global.whatsappClient = new Client({
            authStrategy: new LocalAuth(),
            puppeteer: {
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
            webVersionCache: {
                type: 'remote',
                remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
            }
        });
    }
    client = global.whatsappClient;
}

// Initialize event listeners
// We clear existing listeners to avoid duplicates on hot reload effectively or logic issues
// But client.removeAllListeners() might be too aggressive if internal stuff relies on it.
// Better check listener count.

if (client.listenerCount('qr') === 0) {
    client.on('qr', (qr) => {
        console.log('QR Code received');
        qrcode.generate(qr, { small: true });
        state.qrCodeData = qr;
        state.status = 'QR_READY';
    });

    client.on('ready', () => {
        console.log('Client is ready!');
        state.status = 'READY';
        state.qrCodeData = null;
    });

    client.on('authenticated', () => {
        console.log('Authenticated!');
        state.status = 'AUTHENTICATED';
    });

    client.on('auth_failure', () => {
        console.error('Auth failure');
        state.status = 'DISCONNECTED';
    });

    client.on('disconnected', () => {
        console.log('Client disconnected');
        state.status = 'DISCONNECTED';
        state.qrCodeData = null;
    });
}

export const getWhatsappClient = () => client;

export const getWhatsappStatus = () => ({
    status: state.status,
    qrCode: state.qrCodeData
});

export const initializeWhatsapp = async () => {
    try {
        if (state.status === 'DISCONNECTED') {
            console.log('Initializing WhatsApp Client...');
            await client.initialize();
        }
    } catch (error) {
        console.error('Failed to initialize WhatsApp client:', error);
    }
};

export const getChats = async () => {
    if (state.status !== 'READY') return [];

    try {
        const chats = await client.getChats();

        const formattedChats = await Promise.all(chats.slice(0, 20).map(async (chat) => {
            let avatar = undefined;
            try {
                const contact = await chat.getContact();
                avatar = await contact.getProfilePicUrl();
            } catch (e) {
                // ignore
            }

            return {
                id: chat.id._serialized,
                name: chat.name || chat.id.user,
                lastMessage: chat.lastMessage?.body || '',
                time: chat.timestamp ? new Date(chat.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                unreadCount: chat.unreadCount,
                avatar: avatar
            };
        }));

        return formattedChats;
    } catch (error) {
        console.error('Error fetching chats:', error);
        return [];
    }
};

export const getMessages = async (chatId: string) => {
    if (state.status !== 'READY') return [];
    try {
        const chat = await client.getChatById(chatId);
        const messages = await chat.fetchMessages({ limit: 50 });

        return messages.map(msg => ({
            id: msg.id.id,
            text: msg.body,
            sender: msg.fromMe ? 'me' : 'them',
            time: new Date(msg.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: msg.ack === 3 ? 'read' : (msg.ack === 2 ? 'delivered' : 'sent')
        }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
};

export const sendMessage = async (chatId: string, message: string) => {
    if (state.status !== 'READY') throw new Error('Client not ready');
    try {
        await client.sendMessage(chatId, message);
        return { success: true };
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};
