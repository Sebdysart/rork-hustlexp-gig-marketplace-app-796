import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface AutoTranslateProps extends TextProps {
  children: string;
}

export function AutoTranslate({ children, style, ...props }: AutoTranslateProps) {
  const translatedText = useTranslatedText(children);
  // CRITICAL: Always ensure we have a renderable string value
  const safeText = translatedText && translatedText.trim() && translatedText.trim() !== '.' 
    ? translatedText 
    : (children || ' ');
  
  return (
    <Text style={style} {...props}>
      {safeText}
    </Text>
  );
}

export default AutoTranslate;
