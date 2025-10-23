import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import { premiumColors } from '@/constants/designTokens';

export default function Index() {
  const router = useRouter();
  const { currentUser, hasOnboarded, isLoading } = useApp();

  useEffect(() => {
    if (isLoading) return;

    console.log('Index routing check:', { currentUser: !!currentUser, hasOnboarded, isLoading });

    if (currentUser) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/sign-in');
    }
  }, [currentUser, hasOnboarded, isLoading, router]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack]}
        style={StyleSheet.absoluteFill}
      />
      <ActivityIndicator size="large" color={premiumColors.neonCyan} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
