import { NextRequest } from "next/server";
import { realtimeManager } from "@/lib/realtime";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    // Send initial connection successful event
    writer.write(encoder.encode("event: connected\ndata: {}\n\n"));

    const unsubscribe = realtimeManager.subscribe((event) => {
        try {
            writer.write(encoder.encode(`event: message\ndata: ${JSON.stringify(event)}\n\n`));
        } catch (e) {
            console.error("Error writing to client stream:", e);
        }
    });

    // Send keep-alive comments every 30s to prevent router timeouts
    const heartbeatInterval = setInterval(() => {
        try {
            writer.write(encoder.encode(":\n\n"));
        } catch (e) {
            // Connection might already be closed
        }
    }, 30000);

    // Clean up on disconnect
    request.signal.addEventListener("abort", () => {
        unsubscribe();
        clearInterval(heartbeatInterval);
        try {
            writer.close();
        } catch (e) {
            // Already closed
        }
    });

    return new Response(responseStream.readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
