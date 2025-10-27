import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Sparkles, ThumbsUp, ThumbsDown, AlertCircle, Lightbulb, TrendingUp, MessageCircle } from 'lucide-react-native';
import { premiumColors, COLORS } from '@/constants/designTokens';
import { triggerHaptic } from '@/utils/haptics';
import { hustleAI } from '@/utils/hustleAI';

interface ChatMessage {
  senderId: string;
  text: string;
  timestamp: string;
}

interface Suggestion {
  id: string;
  type: 'quick_reply' | 'negotiation' | 'clarification' | 'tone_advice';
  text: string;
  icon: string;
  color: string;
  reasoning?: string;
}

interface AIChatSuggestionsProps {
  messages: ChatMessage[];
  currentUserId: string;
  taskContext?: {
    title: string;
    category: string;
    payAmount: number;
    negotiable?: boolean;
  };
  onSuggestionSelect: (text: string) => void;
  onDismiss?: () => void;
}

export default function AIChatSuggestions({
  messages,
  currentUserId,
  taskContext,
  onSuggestionSelect,
  onDismiss,
}: AIChatSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showToneAnalysis, setShowToneAnalysis] = useState<boolean>(false);
  const [toneAnalysis, setToneAnalysis] = useState<{
    sentiment: 'positive' | 'neutral' | 'negative';
    professionalism: number;
    urgency: number;
    negotiation_signals: string[];
  } | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (messages.length > 0) {
      analyzeChatAndGenerateSuggestions();
    }
  }, [messages]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const analyzeChatAndGenerateSuggestions = async () => {
    setLoading(true);
    try {
      const lastMessage = messages[messages.length - 1];
      const isFromOther = lastMessage.senderId !== currentUserId;

      if (!isFromOther) {
        setSuggestions([]);
        setLoading(false);
        return;
      }

      const conversationContext = messages
        .slice(-5)
        .map((m) => `${m.senderId === currentUserId ? 'Me' : 'Them'}: ${m.text}`)
        .join('\n');

      const prompt = `You are analyzing a conversation about a gig task. Generate 3-4 smart reply suggestions.

Task Context:
- Title: ${taskContext?.title || 'N/A'}
- Category: ${taskContext?.category || 'N/A'}
- Pay: $${taskContext?.payAmount || 'N/A'}
- Negotiable: ${taskContext?.negotiable ? 'Yes' : 'No'}

Recent Conversation:
${conversationContext}

Analyze the tone and intent, then provide:
1. Quick Replies (2-3 options): Short, natural responses
2. Negotiation Tips (if applicable): Professional counter-offers or questions
3. Tone Analysis: sentiment, professionalism score, urgency level, negotiation signals

Return JSON:
{
  "quick_replies": ["Reply 1", "Reply 2", "Reply 3"],
  "negotiation_tips": ["Tip 1 if applicable"],
  "tone_analysis": {
    "sentiment": "positive/neutral/negative",
    "professionalism": 0-100,
    "urgency": 0-100,
    "negotiation_signals": ["signal1", "signal2"]
  }
}`;

      console.log('[AI Chat Suggestions] Requesting AI analysis...');
      const response = await hustleAI.chat('system', prompt);
      const aiResult = JSON.parse(response.response);

      const newSuggestions: Suggestion[] = [];

      aiResult.quick_replies?.forEach((reply: string, idx: number) => {
        newSuggestions.push({
          id: `quick-${idx}`,
          type: 'quick_reply',
          text: reply,
          icon: '💬',
          color: premiumColors.neonCyan,
        });
      });

      if (aiResult.negotiation_tips && aiResult.negotiation_tips.length > 0) {
        aiResult.negotiation_tips.forEach((tip: string, idx: number) => {
          newSuggestions.push({
            id: `negotiation-${idx}`,
            type: 'negotiation',
            text: tip,
            icon: '💰',
            color: premiumColors.neonGreen,
            reasoning: 'AI detected negotiation opportunity',
          });
        });
      }

      if (aiResult.tone_analysis) {
        setToneAnalysis(aiResult.tone_analysis);

        if (aiResult.tone_analysis.sentiment === 'negative') {
          newSuggestions.push({
            id: 'tone-advice',
            type: 'tone_advice',
            text: 'Keep it professional and positive to maintain good rapport',
            icon: '⚠️',
            color: premiumColors.neonAmber,
            reasoning: 'AI detected negative tone',
          });
        }

        if (aiResult.tone_analysis.urgency > 70) {
          newSuggestions.push({
            id: 'urgency-advice',
            type: 'tone_advice',
            text: 'They seem urgent - respond quickly or mention your availability',
            icon: '⚡',
            color: premiumColors.neonViolet,
            reasoning: 'High urgency detected',
          });
        }
      }

      setSuggestions(newSuggestions);
      console.log('[AI Chat Suggestions] Generated', newSuggestions.length, 'suggestions');
    } catch (error) {
      console.error('[AI Chat Suggestions] Error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    triggerHaptic('light');
    onSuggestionSelect(suggestion.text);
  };

  const getToneColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return premiumColors.neonGreen;
      case 'negative':
        return premiumColors.neonMagenta;
      default:
        return premiumColors.neonCyan;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={premiumColors.neonCyan} />
        <Text style={styles.loadingText}>AI analyzing conversation...</Text>
      </View>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={16} color={premiumColors.neonCyan} />
          <Text style={styles.title}>AI Suggestions</Text>
        </View>
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <Text style={styles.dismissText}>×</Text>
        </TouchableOpacity>
      </View>

      {toneAnalysis && (
        <TouchableOpacity
          style={styles.toneBar}
          onPress={() => {
            setShowToneAnalysis(!showToneAnalysis);
            triggerHaptic('light');
          }}
        >
          <AlertCircle size={14} color={getToneColor(toneAnalysis.sentiment)} />
          <Text style={[styles.toneText, { color: getToneColor(toneAnalysis.sentiment) }]}>
            {toneAnalysis.sentiment.charAt(0).toUpperCase() + toneAnalysis.sentiment.slice(1)} tone
          </Text>
          <View style={styles.toneBadge}>
            <Text style={styles.toneBadgeText}>{toneAnalysis.professionalism}%</Text>
          </View>
          {toneAnalysis.urgency > 50 && (
            <View style={[styles.urgencyBadge, { backgroundColor: premiumColors.neonAmber + '20' }]}>
              <TrendingUp size={12} color={premiumColors.neonAmber} />
              <Text style={[styles.urgencyText, { color: premiumColors.neonAmber }]}>Urgent</Text>
            </View>
          )}
        </TouchableOpacity>
      )}

      {showToneAnalysis && toneAnalysis && toneAnalysis.negotiation_signals.length > 0 && (
        <View style={styles.negotiationSignals}>
          <View style={styles.negotiationHeader}>
            <Lightbulb size={14} color={premiumColors.neonAmber} />
            <Text style={styles.negotiationTitle}>Negotiation Signals Detected:</Text>
          </View>
          {toneAnalysis.negotiation_signals.map((signal, idx) => (
            <View key={idx} style={styles.signalItem}>
              <View style={styles.signalDot} />
              <Text style={styles.signalText}>{signal}</Text>
            </View>
          ))}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsScroll}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[
              styles.suggestionCard,
              { borderColor: suggestion.color + '40' },
            ]}
            onPress={() => handleSuggestionPress(suggestion)}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionHeader}>
              <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
              {suggestion.reasoning && (
                <View style={[styles.reasoningBadge, { backgroundColor: suggestion.color + '20' }]}>
                  <Text style={[styles.reasoningText, { color: suggestion.color }]}>AI</Text>
                </View>
              )}
            </View>
            <Text style={styles.suggestionText} numberOfLines={3}>
              {suggestion.text}
            </Text>
            {suggestion.reasoning && (
              <Text style={styles.suggestionReasoning} numberOfLines={2}>
                {suggestion.reasoning}
              </Text>
            )}
            <View style={styles.suggestionFooter}>
              <MessageCircle size={12} color={COLORS.textSecondary} />
              <Text style={styles.suggestionType}>
                {suggestion.type.replace('_', ' ')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Tap a suggestion to use it • AI-powered recommendations
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '30',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 12,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: COLORS.text,
  },
  dismissButton: {
    padding: 4,
  },
  dismissText: {
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300' as const,
  },
  toneBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  toneText: {
    fontSize: 12,
    fontWeight: '600' as const,
    flex: 1,
  },
  toneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: premiumColors.neonCyan + '20',
    borderRadius: 8,
  },
  toneBadgeText: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  negotiationSignals: {
    padding: 12,
    backgroundColor: premiumColors.neonAmber + '10',
    borderRadius: 8,
    marginBottom: 12,
  },
  negotiationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  negotiationTitle: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: premiumColors.neonAmber,
  },
  signalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  signalDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: premiumColors.neonAmber,
  },
  signalText: {
    fontSize: 11,
    color: COLORS.text,
  },
  suggestionsScroll: {
    gap: 12,
    paddingBottom: 8,
  },
  suggestionCard: {
    width: 200,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  suggestionIcon: {
    fontSize: 20,
  },
  reasoningBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  reasoningText: {
    fontSize: 10,
    fontWeight: '700' as const,
  },
  suggestionText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
    marginBottom: 8,
  },
  suggestionReasoning: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontStyle: 'italic' as const,
    marginBottom: 8,
  },
  suggestionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  suggestionType: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'capitalize' as const,
  },
  footer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: premiumColors.glassWhite,
  },
  footerText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
