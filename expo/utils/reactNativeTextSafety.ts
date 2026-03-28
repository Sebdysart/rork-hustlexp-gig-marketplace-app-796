/**
 * React Native Text Safety Utilities
 * 
 * This file provides utilities to prevent the common error:
 * "Unexpected text node: . A text node cannot be a child of a <View>."
 * 
 * This error occurs when:
 * 1. Text is rendered directly in a View without a Text wrapper
 * 2. Empty strings, single dots, or whitespace are rendered
 * 3. Boolean/undefined values are coerced to strings
 * 4. Translation hooks return empty strings during loading
 */

/**
 * Ensures a string is safe to render in React Native Text components
 * Returns a non-breaking space if the input is empty, a single dot, or whitespace
 */
export function safeTextValue(value: string | undefined | null): string {
  if (!value) return '\u00A0'; // Non-breaking space
  
  const trimmed = value.trim();
  
  // Check for problematic values
  if (trimmed === '' || trimmed === '.') {
    return '\u00A0'; // Non-breaking space
  }
  
  return value;
}

/**
 * Checks if a value is safe to render as a text node
 */
export function isSafeTextNode(value: any): boolean {
  if (typeof value !== 'string') return false;
  if (!value) return false;
  
  const trimmed = value.trim();
  return trimmed !== '' && trimmed !== '.';
}

/**
 * Sanitizes translation results that might cause rendering errors
 */
export function sanitizeTranslation(
  translated: string | undefined,
  fallback: string
): string {
  if (!translated || translated.trim() === '' || translated.trim() === '.') {
    return fallback || '\u00A0';
  }
  return translated;
}

/**
 * Array version - sanitizes multiple translation results
 */
export function sanitizeTranslations(
  translations: (string | undefined)[],
  fallbacks: string[]
): string[] {
  return translations.map((trans, index) => 
    sanitizeTranslation(trans, fallbacks[index] || '\u00A0')
  );
}
