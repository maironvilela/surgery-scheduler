"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"



// Actually implementing a lightweight version without Radix primitives to avoid "npm install" dependency issues for the user if they don't have it,
// BUT standard shadcn uses radix-ui/react-dialog.
// I will implement a pure CSS/React version to be safe and self-contained, or I can check package.json.
// Let's check package.json first to see if we have radix.

import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

const sheetVariants = cva(
    "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
    {
        variants: {
            side: {
                top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
                bottom:
                    "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
                left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
                right:
                    "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
            },
        },
        defaultVariants: {
            side: "right",
        },
    }
)

interface SheetProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
}

const SheetContext = React.createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export function Sheet({ children, open: controlledOpen, onOpenChange }: SheetProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
    const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
    const setOpen = onOpenChange || setUncontrolledOpen;

    return (
        <SheetContext.Provider value={{ open, setOpen }}>
            {children}
        </SheetContext.Provider>
    );
}

export const SheetTrigger = ({ className, children, asChild = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => {
    const context = React.useContext(SheetContext);
    const Comp = asChild ? Slot : "div"
    return (
        <Comp
            onClick={() => context?.setOpen(true)}
            className={className}
            {...props}
        >
            {children}
        </Comp>
    );
}

export const SheetClose = ({ className, children, asChild = false, ...props }: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }) => {
    const context = React.useContext(SheetContext);
    const Comp = asChild ? Slot : "div"
    return (
        <Comp
            onClick={() => context?.setOpen(false)}
            className={className}
            {...props}
        >
            {children}
        </Comp>
    );
}

export const SheetContent = ({ className, children, side = "right", ...props }: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof sheetVariants>) => {
    const context = React.useContext(SheetContext);

    if (!context?.open) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
                onClick={() => context.setOpen(false)}
            />
            <div
                className={cn(sheetVariants({ side }), className)}
                {...props}
            >
                <div
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary cursor-pointer"
                    onClick={() => context.setOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </div>
                {children}
            </div>
        </>
    );
}

export const SheetHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-2 text-center sm:text-left",
            className
        )}
        {...props}
    />
)

export const SheetFooter = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
            className
        )}
        {...props}
    />
)

export const SheetTitle = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2
        className={cn("text-lg font-semibold text-foreground", className)}
        {...props}
    />
)

export const SheetDescription = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
    />
)
