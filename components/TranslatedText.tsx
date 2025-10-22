import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface TranslatedTextProps extends TextProps {
  children: string;
}

export default function TranslatedText({ children, ...props }: TranslatedTextProps) {
  const translatedText = useTranslatedText(children);
  
  return <Text {...props}>{translatedText}</Text>;
}
