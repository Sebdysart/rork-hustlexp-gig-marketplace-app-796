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
  
  return <Text {...props}>{translated}</Text>;
}

export default AutoTranslateText;
