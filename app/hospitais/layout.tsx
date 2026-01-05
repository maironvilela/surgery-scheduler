"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function HospitalsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isDetailPage = pathname !== "/hospitais";

    // Define direction based on whether we are going to a detail page or back to list
    // If we are on detail page, we came from list (slide right-to-left)
    // If we are on list page, we came from detail (slide left-to-right)
    // NOTE: This logic assumes simple 2-level navigation for now.

    // Actually, `custom` prop in AnimatePresence is key for dynamic direction, but simpler approach:
    // Just force the animation for the *current* view based on its type.

    // When Key changes, AnimatePresence handles the exit/enter.
    // We want:
    // Case 1: List -> Detail
    //   List (Exit): x: -100%
    //   Detail (Enter): x: 100% -> 0

    // Case 2: Detail -> List
    //   Detail (Exit): x: 100%
    //   List (Enter): x: -100% -> 0

    // We need to know the *previous* path to determine direction, but simpler:
    // Detail Page always enters from Right, exits to Right (when going back) OR exits to Left (if going deeper)? 
    // Wait, "Slide Left" means: Old View goes Left, New View comes from Right.
    // "Slide Right" (Back): Old View goes Right, New View comes from Left.

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
