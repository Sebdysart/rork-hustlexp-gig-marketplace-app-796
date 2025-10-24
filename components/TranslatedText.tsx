import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface TranslatedTextProps extends TextProps {
  children: string;
}

export default function TranslatedText({ children, ...props }: TranslatedTextProps) {
  const translatedText = useTranslatedText(children);
  // Safety check: never render empty strings or single dots
  const safeText = translatedText && translatedText.trim() !== '.' && translatedText.trim() !== '' ? translatedText : (children || '');
  
  return <Text {...props}>{safeText}</Text>;
}
