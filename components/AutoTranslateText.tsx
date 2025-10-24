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
    // Handle non-string or disabled case
    if (typeof children === 'string' && (!children || !children.trim())) {
      return null;
    }
    return <Text {...props}>{children}</Text>;
  }
  
  // CRITICAL: Always ensure we have a renderable string value
  const safeText = translated && translated.trim() && translated.trim() !== '.' 
    ? translated 
    : (textContent || '');
  
  // Don't render if empty to prevent text node errors
  if (!safeText || !safeText.trim()) {
    return null;
  }
  
  return <Text {...props}>{safeText}</Text>;
}

export default AutoTranslateText;
