"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PatientsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDetailPage = pathname !== "/pacientes";

    return (
        <div className="relative w-full h-full overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={isDetailPage ? 1 : -1}>
                <motion.div
                    key={pathname}
                    className="w-full h-full overflow-y-auto"
                    custom={isDetailPage ? 1 : -1}
                    variants={{
                        enter: (direction: number) => ({
                            x: direction > 0 ? "100%" : "-100%",
                            opacity: 0,
                        }),
                        center: {
                            x: 0,
                            opacity: 1,
                        },
                        exit: (direction: number) => ({
                            x: direction < 0 ? "100%" : "-100%",
                            opacity: 0,
                        }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 80, damping: 20 },
                        opacity: { duration: 0.5 },
                    }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
