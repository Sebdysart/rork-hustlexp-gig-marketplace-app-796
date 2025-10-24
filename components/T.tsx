import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface TProps extends Omit<TextProps, 'children'> {
  children: string;
}

export function T({ children, ...props }: TProps) {
  const translated = useTranslatedText(children);
  // CRITICAL: Always ensure we have a renderable string value
  const safeText = translated && translated.trim() && translated.trim() !== '.' 
    ? translated 
    : (children || '');
  return <Text {...props}>{safeText}</Text>;
}

export default T;
