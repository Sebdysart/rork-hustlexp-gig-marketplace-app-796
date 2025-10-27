import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import {
  TrendingUp,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Sparkles,
} from 'lucide-react-native';
import { NegotiationSuggestion, getRiskColor, getNegotiationColor } from '@/utils/aiSmartNegotiations';
import { premiumColors } from '@/constants/designTokens';
import * as Clipboard from 'expo-clipboard';

interface SmartNegotiationPanelProps {
  suggestion: NegotiationSuggestion;
  originalAmount: number;
  onAcceptSuggestion?: (amount: number) => void;
  onUseScript?: (script: string) => void;
}

export function SmartNegotiationPanel({
  suggestion,
  originalAmount,
  onAcceptSuggestion,
  onUseScript,
}: SmartNegotiationPanelProps) {
  const [copiedScript, setCopiedScript] = useState(false);

  const increasePercent = ((suggestion.suggestedAmount / originalAmount - 1) * 100).toFixed(0);
  const increaseAmount = suggestion.suggestedAmount - originalAmount;

  const handleCopyScript = async () => {
    await Clipboard.setStringAsync(suggestion.counterOfferScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Sparkles size={24} color={premiumColors.neonCyan} />
        <Text style={styles.title}>AI Negotiation Strategy</Text>
      </View>

      <View style={[styles.suggestionCard, { borderColor: getNegotiationColor(suggestion.confidence) }]}>
        <View style={styles.suggestionHeader}>
          <View>
            <Text style={styles.suggestedLabel}>Suggested Counter-Offer</Text>
            <Text style={[styles.suggestedAmount, { color: getNegotiationColor(suggestion.confidence) }]}>
              ${suggestion.suggestedAmount}
            </Text>
          </View>
          <View style={styles.changeIndicator}>
            <TrendingUp size={20} color={premiumColors.neonGreen} />
            <Text style={styles.changeText}>+${increaseAmount}</Text>
            <Text style={styles.changePercent}>(+{increasePercent}%)</Text>
          </View>
        </View>

        <View style={styles.confidenceBadge}>
          <Text style={styles.confidenceLabel}>Confidence</Text>
          <View style={styles.confidenceBar}>
            <View
              style={[
                styles.confidenceFill,
                {
                  width: `${suggestion.confidence}%`,
                  backgroundColor: getNegotiationColor(suggestion.confidence),
                },
              ]}
            />
          </View>
          <Text style={[styles.confidenceValue, { color: getNegotiationColor(suggestion.confidence) }]}>
            {suggestion.confidence}%
          </Text>
        </View>

        <Text style={styles.reasoning}>{suggestion.reasoning}</Text>

        {onAcceptSuggestion && (
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: getNegotiationColor(suggestion.confidence) }]}
            onPress={() => onAcceptSuggestion(suggestion.suggestedAmount)}
          >
            <CheckCircle2 size={18} color="#000" />
            <Text style={styles.actionButtonText}>Use This Amount</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Target size={18} color={premiumColors.neonViolet} />
          <Text style={styles.sectionTitle}>Counter-Offer Script</Text>
        </View>
        
        <View style={styles.scriptCard}>
          <Text style={styles.scriptText}>{suggestion.counterOfferScript}</Text>
          
          <View style={styles.scriptActions}>
            <TouchableOpacity style={styles.copyButton} onPress={handleCopyScript}>
              {copiedScript ? (
                <>
                  <CheckCircle2 size={16} color={premiumColors.neonGreen} />
                  <Text style={[styles.copyButtonText, { color: premiumColors.neonGreen }]}>Copied!</Text>
                </>
              ) : (
                <>
                  <Copy size={16} color={premiumColors.neonCyan} />
                  <Text style={styles.copyButtonText}>Copy Script</Text>
                </>
              )}
            </TouchableOpacity>

            {onUseScript && (
              <TouchableOpacity
                style={[styles.useScriptButton, { backgroundColor: premiumColors.neonCyan }]}
                onPress={() => onUseScript(suggestion.counterOfferScript)}
              >
                <Text style={styles.useScriptButtonText}>Use in Message</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <DollarSign size={18} color={premiumColors.gritGold} />
          <Text style={styles.sectionTitle}>Market Insights</Text>
        </View>
        
        {suggestion.marketInsights.map((insight, index) => (
          <View key={index} style={styles.insightRow}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AlertTriangle size={18} color={premiumColors.neonAmber} />
          <Text style={styles.sectionTitle}>Risk Assessment</Text>
        </View>

        <View style={[styles.riskCard, { borderColor: getRiskColor(suggestion.riskAssessment.riskLevel) }]}>
          <View style={styles.riskHeader}>
            <View style={styles.riskBadge}>
              <Text
                style={[
                  styles.riskLabel,
                  { color: getRiskColor(suggestion.riskAssessment.riskLevel) },
                ]}
              >
                {suggestion.riskAssessment.riskLevel.toUpperCase()} RISK
              </Text>
            </View>
            <Text style={styles.acceptanceChance}>
              {suggestion.riskAssessment.chanceOfAcceptance}% acceptance chance
            </Text>
          </View>

          <Text style={styles.riskSectionLabel}>Potential Downsides:</Text>
          {suggestion.riskAssessment.potentialDownsides.map((downside, index) => (
            <View key={index} style={styles.downsideRow}>
              <Text style={styles.downsideBullet}>•</Text>
              <Text style={styles.downsideText}>{downside}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <TrendingUp size={18} color={premiumColors.neonMagenta} />
          <Text style={styles.sectionTitle}>Alternative Strategies</Text>
        </View>

        {suggestion.alternatives.map((alt, index) => (
          <View key={index} style={styles.alternativeCard}>
            <View style={styles.alternativeHeader}>
              <Text style={styles.alternativeOption}>{alt.option}</Text>
              <Text style={styles.alternativeAmount}>${alt.amount}</Text>
            </View>

            <View style={styles.prosConsRow}>
              <View style={styles.prosConsColumn}>
                <Text style={styles.prosLabel}>Pros</Text>
                {alt.pros.map((pro, i) => (
                  <Text key={i} style={styles.proText}>
                    + {pro}
                  </Text>
                ))}
              </View>

              <View style={styles.prosConsColumn}>
                <Text style={styles.consLabel}>Cons</Text>
                {alt.cons.map((con, i) => (
                  <Text key={i} style={styles.conText}>
                    - {con}
                  </Text>
                ))}
              </View>
            </View>

            {onAcceptSuggestion && (
              <TouchableOpacity
                style={styles.altActionButton}
                onPress={() => onAcceptSuggestion(alt.amount)}
              >
                <Text style={styles.altActionButtonText}>Use ${alt.amount}</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  suggestionCard: {
    margin: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  suggestedLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  suggestedAmount: {
    fontSize: 32,
    fontWeight: '800',
  },
  changeIndicator: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumColors.neonGreen,
    marginTop: 4,
  },
  changePercent: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(0, 255, 136, 0.7)',
    marginTop: 2,
  },
  confidenceBadge: {
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 6,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
  },
  reasoning: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  scriptCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
  },
  scriptActions: {
    flexDirection: 'row',
    gap: 8,
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: premiumColors.neonCyan,
  },
  copyButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: premiumColors.neonCyan,
  },
  useScriptButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  useScriptButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: premiumColors.gritGold,
    marginTop: 6,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  riskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  riskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  riskLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  acceptanceChance: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  riskSectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  downsideRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  downsideBullet: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  downsideText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  alternativeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  alternativeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alternativeOption: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  alternativeAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: premiumColors.neonMagenta,
  },
  prosConsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  prosConsColumn: {
    flex: 1,
  },
  prosLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: premiumColors.neonGreen,
    marginBottom: 6,
  },
  proText: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(0, 255, 136, 0.8)',
    marginBottom: 3,
  },
  consLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: premiumColors.neonMagenta,
    marginBottom: 6,
  },
  conText: {
    fontSize: 11,
    lineHeight: 16,
    color: 'rgba(255, 0, 168, 0.8)',
    marginBottom: 3,
  },
  altActionButton: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  altActionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFF',
  },
});
