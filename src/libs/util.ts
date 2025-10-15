import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sum(a: number, b: number): number {
  return a + b
}

export function formatAgentName(nodeName: string): string {
  // Convert camelCase or PascalCase to snake_case
  // Example: "AuditorEspecial" -> "auditor_especial"
  return nodeName
    .replace(/([a-z])([A-Z])/g, '$1_$2') // Add underscore between words
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/node$/i, ''); // Remove 'node' suffix if present
}