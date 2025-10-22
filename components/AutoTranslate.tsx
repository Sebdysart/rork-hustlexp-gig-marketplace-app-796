import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface AutoTranslateProps extends TextProps {
  children: string;
}

export function AutoTranslate({ children, style, ...props }: AutoTranslateProps) {
  const translatedText = useTranslatedText(children);
  
  return (
    <Text style={style} {...props}>
      {translatedText}
    </Text>
  );
}

export default AutoTranslate;
