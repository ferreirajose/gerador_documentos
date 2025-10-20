import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function sum(a: number, b: number): number {
  return a + b
}

export function formatAgentName(nodeName: string): string {
  return nodeName
    // Remove acentos e caracteres especiais
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Remove vírgulas e outros caracteres especiais
    .replace(/[^\w\s]/gi, '')
    // Convert camelCase or PascalCase to snake_case
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    .toLowerCase()
    // Remove 'node' suffix if present
    .replace(/node$/i, '')
    // Remove underscores duplicados que podem ter sido criados
    .replace(/_+/g, '_')
    // Remove underscores no início e fim
    .replace(/^_+|_+$/g, '');
}