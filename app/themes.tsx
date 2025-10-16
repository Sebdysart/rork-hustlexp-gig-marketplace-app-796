import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Lock, Check } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useApp } from '@/contexts/AppContext';
import { THEMES, getUnlockedThemes } from '@/constants/themes';
import { getRarityColor } from '@/utils/gamification';
import { LinearGradient } from 'expo-linear-gradient';

export default function ThemesScreen() {
  const router = useRouter();
  const { selectedTheme, changeTheme } = useTheme();
  const { currentUser } = useApp();

  const unlockedThemes = getUnlockedThemes(currentUser?.level || 1);
  const isThemeUnlocked = (themeId: string) => {
    return unlockedThemes.some(t => t.id === themeId);
  };

  const handleThemeSelect = (themeId: string, unlockLevel: number) => {
    if (!isThemeUnlocked(themeId)) {
      Alert.alert(
        'Theme Locked',
        `Reach level ${unlockLevel} to unlock this theme!`,
        [{ text: 'OK' }]
      );
      return;
    }

    changeTheme(themeId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Themes',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Customize Your Experience</Text>
        <Text style={styles.subtitle}>
          Unlock new themes as you level up and dominate the leaderboards!
        </Text>

        <View style={styles.themesGrid}>
          {THEMES.map((theme) => {
            const unlocked = isThemeUnlocked(theme.id);
            const isSelected = selectedTheme.id === theme.id;

            return (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  isSelected && styles.selectedCard,
                ]}
                onPress={() => handleThemeSelect(theme.id, theme.unlockLevel)}
                disabled={!unlocked}
              >
                <LinearGradient
                  colors={[theme.colors.gradient[0], theme.colors.gradient[1]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.themePreview}
                >
                  {!unlocked && (
                    <View style={styles.lockedOverlay}>
                      <Lock size={32} color="#FFFFFF" />
                    </View>
                  )}

                  {isSelected && unlocked && (
                    <View style={styles.selectedBadge}>
                      <Check size={20} color="#FFFFFF" />
                    </View>
                  )}

                  <Text style={styles.themeIcon}>{theme.icon}</Text>
                </LinearGradient>

                <View style={styles.themeInfo}>
                  <View style={styles.themeHeader}>
                    <Text style={styles.themeName}>{theme.name}</Text>
                    <View
                      style={[
                        styles.rarityBadge,
                        { backgroundColor: getRarityColor(theme.rarity) },
                      ]}
                    >
                      <Text style={styles.rarityText}>
                        {theme.rarity.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.themeDescription}>{theme.description}</Text>

                  <View style={styles.unlockInfo}>
                    {unlocked ? (
                      <Text style={styles.unlockedText}>✓ Unlocked</Text>
                    ) : (
                      <Text style={styles.lockedText}>
                        🔒 Level {theme.unlockLevel} Required
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 24,
  },
  themesGrid: {
    gap: 16,
  },
  themeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: '#8B5CF6',
  },
  themePreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeIcon: {
    fontSize: 48,
  },
  themeInfo: {
    padding: 16,
  },
  themeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
    flex: 1,
  },
  rarityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  themeDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  unlockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unlockedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#10B981',
  },
  lockedText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#EF4444',
  },
});
