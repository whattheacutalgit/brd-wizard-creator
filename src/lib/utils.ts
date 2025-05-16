
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMarkdownText(text: string): string {
  if (!text) return "";
  
  // Handle bold text: Convert **text** or __text__ to <strong>text</strong>
  let formatted = text.replace(/(\*\*|__)(.+?)(\*\*|__)/g, '<strong>$2</strong>');
  
  // Handle italics: Convert _text_ or *text* to <em>text</em> (only if not already handled as bold)
  formatted = formatted.replace(/(_|\*)(.+?)(_|\*)/g, '<em>$2</em>');
  
  // Handle headers (# Header)
  formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold my-2 text-gray-900">$1</h1>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold my-2 text-gray-900">$1</h2>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-base font-bold my-2 text-gray-900">$1</h3>');
  
  // Handle bullet points
  formatted = formatted.replace(/^\* (.+)$/gm, '<li class="ml-4 text-gray-800">• $1</li>');
  
  // Handle asterisks in the middle of text (if not already formatted)
  formatted = formatted.replace(/\s\*([^*]+)\*/g, ' <strong>$1</strong>');
  
  // Return empty non-breaking space if the result is empty
  return formatted || "&nbsp;";
}
