import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface AutoTranslateProps extends TextProps {
  children: string;
}

export function AutoTranslate({ children, style, ...props }: AutoTranslateProps) {
  const translatedText = useTranslatedText(children);
  
  // CRITICAL: Always ensure we have a renderable string value
  // Never return empty strings, dots, or whitespace-only strings
  let safeText = translatedText || children || '';
  
  if (typeof safeText === 'string') {
    const trimmed = safeText.trim();
    if (!trimmed || /^[\.\s,;:!?]*$/.test(trimmed)) {
      safeText = children || ' ';
    }
  } else {
    safeText = String(safeText || ' ');
  }
  
  return (
    <Text style={style} {...props}>
      {safeText}
    </Text>
  );
}

export default AutoTranslate;
