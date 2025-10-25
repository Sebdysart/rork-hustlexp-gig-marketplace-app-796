/**
 * React Native Safety Utilities
 * 
 * Prevents common React Native errors like:
 * - "Unexpected text node: . A text node cannot be a child of a <View>"
 * - Bare text or numbers rendered directly in View components
 */

/**
 * Safely renders text content, ensuring it never returns bare text
 * Always wrap the result in a <Text> component
 */
export function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  const str = String(value);
  const trimmed = str.trim();

  // Block problematic values that cause rendering errors
  if (
    !trimmed ||
    trimmed === '.' ||
    trimmed === '..' ||
    trimmed === '...' ||
    trimmed === '\u2026' ||
    /^[\.\s,;:!?]*$/.test(trimmed)
  ) {
    console.warn('[safeText] Blocked problematic value:', JSON.stringify(str));
    return '';
  }

  return str;
}

/**
 * Safely renders a fallback value if the main value is invalid
 */
export function safeTextWithFallback(value: unknown, fallback: string): string {
  const result = safeText(value);
  return result || safeText(fallback) || '';
}

/**
 * Validates that a component's children are safe to render in React Native
 * Use this in development to catch issues early
 */
export function validateChildren(children: unknown): void {
  if (process.env.NODE_ENV === 'development') {
    if (typeof children === 'string' || typeof children === 'number') {
      console.error(
        '[React Native Safety] Bare text/number detected in children. Wrap in <Text>:',
        children
      );
    }
  }
}
