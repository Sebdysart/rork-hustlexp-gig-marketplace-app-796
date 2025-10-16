import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Platform } from 'react-native';
import { useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { 
  Wrench, 
  Zap, 
  Upload, 
  FileText, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  Shield,
  Award
} from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { premiumColors, spacing, typography, borderRadius, neonGlow } from '@/constants/designTokens';
import { TRADES, TradeCategory, TRADE_BADGE_PROGRESSIONS } from '@/constants/tradesmen';
import GlassCard from '@/components/GlassCard';
import { triggerHaptic } from '@/utils/haptics';
import { generateText } from '@rork/toolkit-sdk';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingStep = 'welcome' | 'trade_selection' | 'experience_input' | 'resume_parse' | 'verification' | 'complete';

export default function TradesmenOnboarding() {
  const router = useRouter();
  const { currentUser, updateUser } = useApp();
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [selectedTrades, setSelectedTrades] = useState<TradeCategory[]>([]);
  const [primaryTrade, setPrimaryTrade] = useState<TradeCategory | null>(null);
  const [experienceText, setExperienceText] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleTradeToggle = (tradeId: TradeCategory) => {
    triggerHaptic('light');
    if (selectedTrades.includes(tradeId)) {
      setSelectedTrades(selectedTrades.filter(t => t !== tradeId));
      if (primaryTrade === tradeId) {
        setPrimaryTrade(null);
      }
    } else {
      setSelectedTrades([...selectedTrades, tradeId]);
      if (!primaryTrade) {
        setPrimaryTrade(tradeId);
      }
    }
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) return;

    setIsParsing(true);
    triggerHaptic('medium');

    try {
      const prompt = `Parse this resume/experience text and extract:
1. Primary trade/skill (electrician, plumber, hvac, mechanic, landscaper, carpenter, painter, roofer, mason, welder)
2. Years of experience (estimate if not explicit)
3. Certifications mentioned
4. Skills and specialties
5. Estimated skill level (apprentice, journeyman, master)

Resume text:
${resumeText}

Return as JSON with keys: primaryTrade, yearsExperience, certifications (array), skills (array), skillLevel, summary`;

      const result = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      const parsed = JSON.parse(result);
      setParsedData(parsed);

      if (parsed.primaryTrade) {
        const tradeId = parsed.primaryTrade.toLowerCase() as TradeCategory;
        if (TRADES.find(t => t.id === tradeId)) {
          setSelectedTrades([tradeId]);
          setPrimaryTrade(tradeId);
        }
      }

      setStep('verification');
    } catch (error) {
      console.error('Resume parsing error:', error);
      setStep('verification');
    } finally {
      setIsParsing(false);
    }
  };

  const handleComplete = async () => {
    if (!currentUser || !primaryTrade) return;

    triggerHaptic('success');

    const tradeXP: Record<string, number> = {};
    const currentBadges: Record<string, string> = {};

    selectedTrades.forEach(trade => {
      const baseXP = parsedData?.yearsExperience 
        ? Math.min(parsedData.yearsExperience * 500, 5000)
        : 0;
      tradeXP[trade] = baseXP;

      const badges = TRADE_BADGE_PROGRESSIONS[trade];
      const badge = badges.find(b => b.xpRequired <= baseXP) || badges[0];
      currentBadges[trade] = badge.level;
    });

    const updatedUser = {
      ...currentUser,
      tradesmanProfile: {
        isPro: true,
        trades: selectedTrades,
        primaryTrade,
        certifications: [],
        tradeXP,
        currentBadges,
        hourlyRate: TRADES.find(t => t.id === primaryTrade)?.baseHourlyRate || 50,
        availableNow: false,
        responseTime: 15,
        completedJobs: 0,
        toolInventory: [],
        portfolio: [],
        businessMetrics: {
          totalEarnings: 0,
          repeatClients: 0,
          averageJobValue: 0,
          onTimeCompletion: 100,
        },
      },
    };

    await updateUser(updatedUser);
    setStep('complete');
  };

  const renderWelcome = () => (
    <View style={styles.stepContainer}>
      <View style={styles.heroSection}>
        <LinearGradient
          colors={[premiumColors.neonAmber + '40', 'transparent']}
          style={styles.heroGradient}
        >
          <View style={styles.heroIcon}>
            <Wrench size={64} color={premiumColors.neonAmber} />
          </View>
          <Text style={styles.heroTitle}>Welcome to Tradesmen Mode</Text>
          <Text style={styles.heroSubtitle}>
            The professional layer for verified tradespeople. Access higher-paying jobs, build your reputation, and grow your business.
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.featuresGrid}>
        {[
          { icon: <Zap size={32} color={premiumColors.neonCyan} />, title: 'GO Mode', desc: 'Instant AI job matching' },
          { icon: <Shield size={32} color={premiumColors.neonGreen} />, title: 'Verified Pro', desc: 'Build trust with badges' },
          { icon: <Award size={32} color={premiumColors.neonAmber} />, title: 'Higher Pay', desc: 'Premium job access' },
        ].map((feature, index) => (
          <GlassCard key={index} style={styles.featureCard}>
            <View style={styles.featureIcon}>{feature.icon}</View>
            <Text style={styles.featureTitle}>{feature.title}</Text>
            <Text style={styles.featureDesc}>{feature.desc}</Text>
          </GlassCard>
        ))}
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          triggerHaptic('medium');
          setStep('trade_selection');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[premiumColors.neonAmber, '#FF9500']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <ArrowRight size={20} color={Colors.text} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderTradeSelection = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Select Your Trade(s)</Text>
      <Text style={styles.stepSubtitle}>Choose all trades you're qualified for</Text>

      <ScrollView style={styles.tradesScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tradesGrid}>
          {TRADES.map((trade) => {
            const isSelected = selectedTrades.includes(trade.id);
            const isPrimary = primaryTrade === trade.id;

            return (
              <TouchableOpacity
                key={trade.id}
                style={[
                  styles.tradeCard,
                  isSelected && styles.tradeCardSelected,
                  isPrimary && styles.tradeCardPrimary,
                ]}
                onPress={() => handleTradeToggle(trade.id)}
                onLongPress={() => {
                  if (isSelected) {
                    triggerHaptic('medium');
                    setPrimaryTrade(trade.id);
                  }
                }}
                activeOpacity={0.7}
              >
                <BlurView intensity={20} tint="dark" style={styles.tradeBlur}>
                  <View style={styles.tradeContent}>
                    <Text style={styles.tradeIcon}>{trade.icon}</Text>
                    <Text style={styles.tradeName}>{trade.name}</Text>
                    <Text style={styles.tradeRate}>${trade.baseHourlyRate}/hr</Text>
                    {isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>Primary</Text>
                      </View>
                    )}
                    {isSelected && !isPrimary && (
                      <CheckCircle size={20} color={premiumColors.neonCyan} style={styles.checkIcon} />
                    )}
                  </View>
                </BlurView>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {selectedTrades.length > 0 && (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            triggerHaptic('medium');
            setStep('experience_input');
          }}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buttonText}>Continue</Text>
            <ArrowRight size={20} color={Colors.text} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderExperienceInput = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Tell Us About Your Experience</Text>
      <Text style={styles.stepSubtitle}>Choose how you'd like to share your background</Text>

      <View style={styles.inputOptions}>
        <GlassCard style={styles.inputOption}>
          <FileText size={32} color={premiumColors.neonCyan} />
          <Text style={styles.inputOptionTitle}>Type Manually</Text>
          <Text style={styles.inputOptionDesc}>Describe your experience</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Years of experience, certifications, specialties..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={6}
            value={experienceText}
            onChangeText={setExperienceText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              triggerHaptic('medium');
              setStep('verification');
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Continue</Text>
          </TouchableOpacity>
        </GlassCard>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <GlassCard style={styles.inputOption}>
          <Upload size={32} color={premiumColors.neonAmber} />
          <Text style={styles.inputOptionTitle}>Paste Resume</Text>
          <Text style={styles.inputOptionDesc}>AI will parse your experience</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Paste your resume text here..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            numberOfLines={6}
            value={resumeText}
            onChangeText={setResumeText}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.primaryButton, styles.parseButton]}
            onPress={handleParseResume}
            disabled={isParsing || !resumeText.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[premiumColors.neonAmber, '#FF9500']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isParsing ? (
                <Text style={styles.buttonText}>Parsing...</Text>
              ) : (
                <>
                  <Sparkles size={20} color={Colors.text} />
                  <Text style={styles.buttonText}>Parse with AI</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </GlassCard>
      </View>
    </View>
  );

  const renderVerification = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Verify Your Profile</Text>
      <Text style={styles.stepSubtitle}>Review and confirm your information</Text>

      <GlassCard style={styles.verificationCard}>
        <View style={styles.verificationRow}>
          <Text style={styles.verificationLabel}>Primary Trade</Text>
          <Text style={styles.verificationValue}>
            {TRADES.find(t => t.id === primaryTrade)?.name || 'Not selected'}
          </Text>
        </View>

        <View style={styles.verificationRow}>
          <Text style={styles.verificationLabel}>Additional Trades</Text>
          <Text style={styles.verificationValue}>
            {selectedTrades.filter(t => t !== primaryTrade).length || 'None'}
          </Text>
        </View>

        {parsedData && (
          <>
            <View style={styles.verificationRow}>
              <Text style={styles.verificationLabel}>Experience</Text>
              <Text style={styles.verificationValue}>
                {parsedData.yearsExperience} years
              </Text>
            </View>

            <View style={styles.verificationRow}>
              <Text style={styles.verificationLabel}>Skill Level</Text>
              <Text style={styles.verificationValue}>
                {parsedData.skillLevel || 'Apprentice'}
              </Text>
            </View>

            {parsedData.certifications?.length > 0 && (
              <View style={styles.verificationRow}>
                <Text style={styles.verificationLabel}>Certifications</Text>
                <Text style={styles.verificationValue}>
                  {parsedData.certifications.length} found
                </Text>
              </View>
            )}
          </>
        )}
      </GlassCard>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleComplete}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[premiumColors.neonGreen, '#00CC66']}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <CheckCircle size={20} color={Colors.text} />
          <Text style={styles.buttonText}>Activate Tradesmen Mode</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderComplete = () => (
    <View style={styles.stepContainer}>
      <View style={styles.completeSection}>
        <LinearGradient
          colors={[premiumColors.neonGreen + '40', 'transparent']}
          style={styles.completeGradient}
        >
          <View style={styles.completeIcon}>
            <CheckCircle size={80} color={premiumColors.neonGreen} />
          </View>
          <Text style={styles.completeTitle}>You're All Set!</Text>
          <Text style={styles.completeSubtitle}>
            Welcome to Tradesmen Mode. You now have access to premium features and higher-paying jobs.
          </Text>
        </LinearGradient>
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => {
          triggerHaptic('success');
          router.replace('/(tabs)/home');
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[premiumColors.neonCyan, premiumColors.neonBlue]}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.buttonText}>Go to Dashboard</Text>
          <ArrowRight size={20} color={Colors.text} />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: 'Tradesmen Onboarding',
          headerShown: true,
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
          },
          headerTintColor: Colors.text,
        }} 
      />

      <LinearGradient
        colors={[premiumColors.deepBlack, premiumColors.richBlack]}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 'welcome' && renderWelcome()}
        {step === 'trade_selection' && renderTradeSelection()}
        {step === 'experience_input' && renderExperienceInput()}
        {step === 'verification' && renderVerification()}
        {step === 'complete' && renderComplete()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  stepContainer: {
    gap: spacing.xl,
  },
  heroSection: {
    marginBottom: spacing.lg,
  },
  heroGradient: {
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  heroIcon: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: premiumColors.glassDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: premiumColors.neonAmber,
    ...neonGlow.amber,
  },
  heroTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  heroSubtitle: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  featureCard: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  featureIcon: {
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  stepTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
  },
  stepSubtitle: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    marginTop: spacing.xs,
  },
  tradesScroll: {
    flex: 1,
  },
  tradesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tradeCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tradeCardSelected: {
    borderColor: premiumColors.neonCyan,
  },
  tradeCardPrimary: {
    borderColor: premiumColors.neonAmber,
    ...neonGlow.amber,
  },
  tradeBlur: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  tradeContent: {
    padding: spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tradeIcon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  tradeName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  tradeRate: {
    fontSize: typography.sizes.xs,
    color: Colors.textSecondary,
  },
  primaryBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: premiumColors.neonAmber,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
    borderRadius: borderRadius.full,
  },
  primaryBadgeText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: premiumColors.deepBlack,
  },
  checkIcon: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
  },
  inputOptions: {
    gap: spacing.lg,
  },
  inputOption: {
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  inputOptionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
  inputOptionDesc: {
    fontSize: typography.sizes.sm,
    color: Colors.textSecondary,
  },
  textArea: {
    width: '100%',
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: Colors.text,
    fontSize: typography.sizes.base,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    minHeight: 120,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: premiumColors.glassWhite,
  },
  dividerText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: Colors.textSecondary,
  },
  verificationCard: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  verificationLabel: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
  },
  verificationValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  completeSection: {
    marginVertical: spacing.xxl,
  },
  completeGradient: {
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  completeIcon: {
    marginBottom: spacing.lg,
  },
  completeTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.heavy,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  completeSubtitle: {
    fontSize: typography.sizes.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  primaryButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  parseButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: premiumColors.glassDark,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: Colors.text,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: Colors.text,
  },
});
