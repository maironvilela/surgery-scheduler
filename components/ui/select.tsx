"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"

interface SelectContextType {
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    labels: Record<string, React.ReactNode>;
    registerLabel: (value: string, label: React.ReactNode) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const Select = ({ value, onValueChange, children }: { value: string, onValueChange: (val: string) => void, children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false);
    const [labels, setLabels] = React.useState<Record<string, React.ReactNode>>({});

    const registerLabel = React.useCallback((val: string, label: React.ReactNode) => {
        setLabels(prev => {
            if (prev[val] === label) return prev;
            return { ...prev, [val]: label };
        });
    }, []);

    return (
        <SelectContext.Provider value={{ value, onValueChange, open, setOpen, labels, registerLabel }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = ({ className, children }: { className?: string, children: React.ReactNode }) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectTrigger must be used within Select");

    return (
        <button
            type="button"
            onClick={() => context.setOpen(!context.open)}
            className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
        >
            {children}
            <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
    );
};

const SelectValue = ({ placeholder }: { placeholder?: string }) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectValue must be used within Select");

    const displayValue = context.value ? (context.labels[context.value] || context.value) : placeholder;

    return <span className="block truncate">{displayValue}</span>;
};

const SelectContent = ({ children }: { children: React.ReactNode }) => {
    const context = React.useContext(SelectContext);
    const [mounted, setMounted] = React.useState(false);
    const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

    React.useEffect(() => {
        setMounted(true);
    }, []);

    React.useEffect(() => {
        if (context?.open) {
            const updatePosition = () => {
                const trigger = document.activeElement as HTMLElement;
                if (trigger && trigger.tagName === 'BUTTON') {
                    const rect = trigger.getBoundingClientRect();
                    setCoords({
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX,
                        width: rect.width
                    });
                }
            };
            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);
            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [context?.open]);

    if (!context || !context.open || !mounted) return null;

    return createPortal(
        <div
            style={{
                position: 'absolute',
                top: coords.top + 4,
                left: coords.left,
                width: coords.width,
                zIndex: 9999
            }}
            className="min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80"
        >
            <div className="p-1">{children}</div>
        </div>,
        document.body
    );
};

const SelectItem = ({ value, children }: { value: string, children: React.ReactNode }) => {
    const context = React.useContext(SelectContext);
    if (!context) throw new Error("SelectItem must be used within Select");

    const isSelected = context.value === value;

    React.useEffect(() => {
        context.registerLabel(value, children);
    }, [value, children, context.registerLabel]);

    return (
        <div
            className={cn(
                "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                isSelected && "bg-accent text-accent-foreground"
            )}
            onClick={() => {
                context.onValueChange(value);
                context.setOpen(false);
            }}
        >
            {isSelected && (
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="h-4 w-4" />
                </span>
            )}
            {children}
        </div>
    );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
