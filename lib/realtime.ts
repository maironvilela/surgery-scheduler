import { EventEmitter } from "events";

export type RealtimeEvent = {
    entity: "surgery" | "consultation";
    type: "add" | "update" | "delete" | "clear" | "comment";
    payload: any;
};

class RealtimeManager {
    private emitter = new EventEmitter();

    constructor() {
        this.emitter.setMaxListeners(100);
    }

    subscribe(callback: (event: RealtimeEvent) => void) {
        this.emitter.on("event", callback);
        return () => {
            this.emitter.off("event", callback);
        };
    }

    publish(event: RealtimeEvent) {
        this.emitter.emit("event", event);
    }
}

// In Next.js dev server, modules can be reloaded.
// Storing the instance on the global object prevents creating multiple emitters.
const globalForRealtime = global as unknown as {
    realtimeManager: RealtimeManager | undefined;
};

export const realtimeManager = globalForRealtime.realtimeManager ?? new RealtimeManager();

if (process.env.NODE_ENV !== "production") {
    globalForRealtime.realtimeManager = realtimeManager;
}
