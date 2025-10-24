import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';
import { ReactNode } from 'react';

interface AutoTranslateTextProps extends TextProps {
  children: string | ReactNode;
  disabled?: boolean;
}

export function AutoTranslateText({ children, disabled, ...props }: AutoTranslateTextProps) {
  const textContent = typeof children === 'string' ? children : '';
  const translated = useTranslatedText(textContent);
  
  if (disabled || typeof children !== 'string') {
    return <Text {...props}>{children}</Text>;
  }
  
  // Safety check: never render empty strings or single dots
  const safeText = translated && translated.trim() !== '.' && translated.trim() !== '' ? translated : (textContent || '');
  return <Text {...props}>{safeText}</Text>;
}

export default AutoTranslateText;
