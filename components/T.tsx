import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface TProps extends Omit<TextProps, 'children'> {
  children: string;
}

export function T({ children, ...props }: TProps) {
  const translated = useTranslatedText(children);
  // Safety check: never render empty strings or single dots
  const safeText = translated && translated.trim() !== '.' && translated.trim() !== '' ? translated : (children || '\u00A0');
  return <Text {...props}>{safeText}</Text>;
}

export default T;
