import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { MapPin, DollarSign, Zap, Calendar, Radio, Shield, Clock, Brain } from 'lucide-react-native';
import { Task, User } from '@/types';
import Colors from '@/constants/colors';
import { premiumColors, neonGlow, spacing, borderRadius, typography } from '@/constants/designTokens';
import { useRef, useEffect, useState } from 'react';
import GlassCard from './GlassCard';
import { useAIProfile } from '@/contexts/AIProfileContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { aiTranslationService } from '@/utils/aiTranslation';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  poster?: User;
  currentUserLocation?: { lat: number; lng: number };
  showAIInsight?: boolean;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function TaskCard({ task, onPress, poster, currentUserLocation, showAIInsight = true }: TaskCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const { getTaskInsight } = useAIProfile();
  const { currentLanguage, useAITranslation } = useLanguage();
  const [translatedTitle, setTranslatedTitle] = useState(task.title);
  const [translatedDescription, setTranslatedDescription] = useState(task.description);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, [glowAnim]);

  useEffect(() => {
    async function translateTaskContent() {
      if (!useAITranslation || currentLanguage === 'en' || !task.title || !task.description) {
        setTranslatedTitle(task.title);
        setTranslatedDescription(task.description);
        return;
      }

      setIsTranslating(true);
      try {
        const results = await aiTranslationService.translate(
          [task.title, task.description],
          currentLanguage,
          'en'
        );
        setTranslatedTitle(results[0] || task.title);
        setTranslatedDescription(results[1] || task.description);
      } catch (error) {
        console.error('[TaskCard] Translation failed:', error);
        setTranslatedTitle(task.title);
        setTranslatedDescription(task.description);
      } finally {
        setIsTranslating(false);
      }
    }

    translateTaskContent();
  }, [task.title, task.description, currentLanguage, useAITranslation]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };
  const getCategoryEmoji = (category: string) => {
    const emojiMap: Record<string, string> = {
      cleaning: '✨',
      errands: '🏃',
      delivery: '📦',
      moving: '🚚',
      handyman: '🔧',
      tech: '💻',
      creative: '🎨',
      other: '⭐',
    };
    return emojiMap[category] || '⭐';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    return date.toLocaleDateString();
  };

  const getUrgencyPill = () => {
    const urgency = task.urgency || 'flexible';
    const colors = {
      today: { bg: Colors.error + '20', text: Colors.error },
      '48h': { bg: Colors.warning + '20', text: Colors.warning },
      flexible: { bg: Colors.info + '20', text: Colors.info },
    };
    const labels = {
      today: 'Today',
      '48h': '48h',
      flexible: 'Flexible',
    };
    return { color: colors[urgency], label: labels[urgency] };
  };

  const distance = currentUserLocation
    ? calculateDistance(
        currentUserLocation.lat,
        currentUserLocation.lng,
        task.location.lat,
        task.location.lng
      )
    : task.distance;

  const urgencyPill = getUrgencyPill();
  const aiInsight = showAIInsight ? getTaskInsight(task.category, task.payAmount) : null;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity 
        onPress={onPress} 
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Task: ${task.title}. Pay: ${task.payAmount}. ${distance ? `Distance: ${distance.toFixed(1)} kilometers.` : ''} ${urgencyPill.label} urgency. ${task.xpReward} XP reward.`}
        accessibilityHint="Double tap to view task details"
      >
        <GlassCard variant="darkStrong" style={styles.container}>
        <View style={styles.header}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>{getCategoryEmoji(task.category)}</Text>
          </View>
          <View style={styles.headerRight}>
            <View 
              style={[styles.urgencyPill, { backgroundColor: urgencyPill.color.bg }]}
              accessible={true}
              accessibilityLabel={`Urgency: ${urgencyPill.label}`}
            >
              <Clock size={10} color={urgencyPill.color.text} />
              <Text style={[styles.urgencyPillText, { color: urgencyPill.color.text }]}>
                {urgencyPill.label}
              </Text>
            </View>
            {poster?.isOnline && (
              <View 
                style={styles.onlineBadge}
                accessible={true}
                accessibilityLabel="Poster is currently online"
              >
                <Radio size={12} color={Colors.success} />
                <Text style={styles.onlineText}>Online</Text>
              </View>
            )}
            <View 
              style={styles.xpBadge}
              accessible={true}
              accessibilityLabel={`${task.xpReward} experience points reward`}
            >
              <Zap size={14} color={Colors.accent} />
              <Text style={styles.xpText}>{task.xpReward} XP</Text>
            </View>
          </View>
        </View>

        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={2}>{translatedTitle}</Text>
          {task.proofRequired && (
            <View 
              style={styles.proofBadge}
              accessible={true}
              accessibilityLabel="Proof of completion required"
            >
              <Shield size={12} color={Colors.accent} />
            </View>
          )}
        </View>
        <Text style={styles.description} numberOfLines={2}>{translatedDescription}</Text>

        {aiInsight && (
          <View style={styles.aiInsightRow}>
            <Brain size={12} color={premiumColors.neonPurple} />
            <Text style={styles.aiInsightText}>{aiInsight}</Text>
          </View>
        )}

        {task.aiTags && task.aiTags.length > 0 && (
          <View style={styles.aiTagsRow}>
            {task.aiTags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.aiTag}>
                <Text style={styles.aiTagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.infoRow}>
            {distance !== undefined && (
              <>
                <MapPin size={14} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{distance.toFixed(1)} km</Text>
                <Text style={styles.infoDivider}>•</Text>
              </>
            )}
            <Calendar size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{formatDate(task.dateTime || '')}</Text>
          </View>
          <View 
            style={styles.payBadge}
            accessible={true}
            accessibilityLabel={`Payment: ${task.payAmount} dollars`}
          >
            <DollarSign size={16} color={Colors.success} />
            <Text style={styles.payText}>${task.payAmount}</Text>
          </View>
        </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...neonGlow.subtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  onlineText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: Colors.success,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  categoryEmoji: {
    fontSize: 20,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonAmber + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: premiumColors.neonAmber + '40',
  },
  xpText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.accent,
  },
  urgencyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  urgencyPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  proofBadge: {
    backgroundColor: Colors.accent + '20',
    borderRadius: borderRadius.md,
    padding: spacing.xs,
  },
  aiTagsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  aiTag: {
    backgroundColor: Colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  aiTagText: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  infoDivider: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    marginHorizontal: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    marginBottom: spacing.lg,
  },
  footer: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
    flex: 1,
  },
  payBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: premiumColors.neonGreen + '20',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: premiumColors.neonGreen + '40',
  },
  payText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: Colors.success,
  },
  aiInsightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: premiumColors.neonPurple + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: premiumColors.neonPurple + '30',
  },
  aiInsightText: {
    fontSize: typography.sizes.sm,
    color: premiumColors.neonPurple,
    fontWeight: typography.weights.medium,
    flex: 1,
  },
});
