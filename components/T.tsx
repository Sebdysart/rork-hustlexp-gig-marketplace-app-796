import { Text, TextProps } from 'react-native';
import { useTranslatedText } from '@/hooks/useTranslatedText';

interface TProps extends Omit<TextProps, 'children'> {
  children: string;
}

export function T({ children, ...props }: TProps) {
  const translated = useTranslatedText(children);
  return <Text {...props}>{translated}</Text>;
}

export default T;
