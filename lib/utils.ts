import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPhone(value: string) {
  if (!value) return "";

  const r = value.replace(/\D/g, "");

  if (r.length > 10) {
    return r.replace(/^(\d\d)(\d{5})(\d{4}).*/, "($1) $2-$3");
  }

  if (r.length > 5) {
    return r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, "($1) $2-$3");
  }

  if (r.length > 2) {
    return r.replace(/^(\d\d)(\d{0,5})/, "($1) $2");
  }

  return r;
}

export function toTitleCase(str: string) {
  if (!str) return "";
  return str.toLowerCase().split(' ').map(function (word) {
    return (word.charAt(0).toUpperCase() + word.slice(1));
  }).join(' ');
}
