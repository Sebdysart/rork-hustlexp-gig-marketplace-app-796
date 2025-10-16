import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOffers } from '@/contexts/OfferContext';
import { OfferTier, OfferMedia, OfferAvailability } from '@/types';
import { OFFER_CATEGORIES, DEFAULT_TIER_TEMPLATES } from '@/constants/offerCategories';
import { calculateOfferPayout, sanitizeOfferDescription } from '@/utils/offerValidation';
import { CheckCircle, ArrowLeft, ArrowRight, Image as ImageIcon, MapPin } from 'lucide-react-native';
import { COLORS } from '@/constants/colors';

type Step = 'basics' | 'tiers' | 'media' | 'area' | 'review';

const STEPS: Step[] = ['basics', 'tiers', 'media', 'area', 'review'];
const STEP_LABELS = {
  basics: 'Basics',
  tiers: 'Pricing',
  media: 'Media',
  area: 'Service Area',
  review: 'Review',
};

export default function CreateOfferScreen() {
  const router = useRouter();
  const { createOffer, limits, validateOffer } = useOffers();
  
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [subcategory, setSubcategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>('');

  const [tiers, setTiers] = useState<OfferTier[]>([
    { id: 'starter', ...DEFAULT_TIER_TEMPLATES.starter, priceUsd: 50, scope: '' },
    { id: 'standard', ...DEFAULT_TIER_TEMPLATES.standard, priceUsd: 100, scope: '' },
    { id: 'pro', ...DEFAULT_TIER_TEMPLATES.pro, priceUsd: 200, scope: '' },
  ]);

  const [media, setMedia] = useState<OfferMedia[]>([]);
  const [baseZip, setBaseZip] = useState<string>('');
  const [radiusMiles, setRadiusMiles] = useState<number>(15);
  const [onsite, setOnsite] = useState<boolean>(true);
  const [availability] = useState<OfferAvailability[]>([]);
  const [promoText, setPromoText] = useState<string>('');

  const selectedCategory = useMemo(
    () => OFFER_CATEGORIES.find(c => c.id === category),
    [category]
  );

  const currentStepIndex = STEPS.indexOf(currentStep);

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1]);
    } else {
      router.back();
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && tags.length < 8) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleUpdateTier = (index: number, field: keyof OfferTier, value: any) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: value };
    setTiers(updated);
  };

  const handleAddMedia = () => {
    if (media.length < limits.maxMedia) {
      Alert.alert('Add Media', 'Media upload would be integrated with expo-image-picker in production.');
      const newMedia: OfferMedia = {
        id: `media-${Date.now()}`,
        type: 'image',
        uri: `https://picsum.photos/400/300?random=${Date.now()}`,
        cover: media.length === 0,
      };
      setMedia([...media, newMedia]);
    } else {
      Alert.alert('Limit Reached', `Your KYC tier allows max ${limits.maxMedia} media files.`);
    }
  };

  const handleSetCover = (id: string) => {
    setMedia(media.map(m => ({ ...m, cover: m.id === id })));
  };

  const handleRemoveMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const handleSaveDraft = async () => {
    try {
      setIsSubmitting(true);
      const sanitized = sanitizeOfferDescription(description);
      
      await createOffer({
        userId: 'current-user-id',
        title,
        category,
        subcategory,
        description: sanitized,
        tags,
        tiers,
        media,
        baseZip,
        radiusMiles,
        onsite,
        availability,
        status: 'draft',
        promoText,
      });

      Alert.alert('Draft Saved', 'Your offer has been saved as a draft.');
      router.back();
    } catch (error) {
      console.error('[CreateOffer] Save draft failed:', error);
      Alert.alert('Error', 'Failed to save draft. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    try {
      setIsSubmitting(true);
      const sanitized = sanitizeOfferDescription(description);
      
      const draft = {
        userId: 'current-user-id',
        title,
        category,
        subcategory,
        description: sanitized,
        tags,
        tiers,
        media,
        baseZip,
        radiusMiles,
        onsite,
        availability,
        status: 'published' as const,
        promoText,
      };

      const validation = validateOffer(draft);
      if (!validation.valid) {
        Alert.alert('Validation Failed', validation.errors.map(e => `• ${e.message}`).join('\n'));
        return;
      }

      await createOffer(draft);
      
      Alert.alert(
        '🎉 Offer Published!',
        `Your offer "${title}" is now live and discoverable.`
      );
      router.back();
    } catch (error: any) {
      console.error('[CreateOffer] Publish failed:', error);
      Alert.alert('Error', error.message || 'Failed to publish offer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Offer Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Licensed Electrician - Fast, Safe, Affordable"
                placeholderTextColor={COLORS.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={80}
              />
              <Text style={styles.charCount}>{title.length} / 80</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {OFFER_CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.categoryChip, category === cat.id && styles.categoryChipActive]}
                    onPress={() => {
                      setCategory(cat.id);
                      setSubcategory('');
                    }}
                  >
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                    <Text style={[styles.categoryText, category === cat.id && styles.categoryTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {selectedCategory && (
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Subcategory</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                  {selectedCategory.subcategories.map(sub => (
                    <TouchableOpacity
                      key={sub}
                      style={[styles.subChip, subcategory === sub && styles.subChipActive]}
                      onPress={() => setSubcategory(sub)}
                    >
                      <Text style={[styles.subText, subcategory === sub && styles.subTextActive]}>{sub}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Describe your service and what makes you stand out"
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                maxLength={1200}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length} / 1200</Text>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Tags (max 8)</Text>
              <View style={styles.tagInputRow}>
                <TextInput
                  style={[styles.input, styles.tagInput]}
                  placeholder="Add tag..."
                  placeholderTextColor={COLORS.textSecondary}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={handleAddTag}
                />
                <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
                  <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.tagList}>
                {tags.map((tag, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.tag}
                    onPress={() => handleRemoveTag(index)}
                  >
                    <Text style={styles.tagText}>{tag}</Text>
                    <Text style={styles.tagRemove}>✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      case 'tiers':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Pricing Tiers</Text>
            <Text style={styles.stepSubtitle}>Set up 3 service tiers (Starter, Standard, Pro)</Text>

            {tiers.map((tier, index) => {
              const tierName = tier.name;
              const exampleScope = selectedCategory?.exampleScopes[tier.id as 'starter' | 'standard' | 'pro'];
              const payout = calculateOfferPayout(tier.priceUsd, limits.platformFeePercent);

              return (
                <View key={tier.id} style={styles.tierCard}>
                  <Text style={styles.tierName}>{tierName}</Text>
                  
                  <View style={styles.tierRow}>
                    <View style={styles.tierField}>
                      <Text style={styles.tierLabel}>Price (USD) *</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="$0"
                        placeholderTextColor={COLORS.textSecondary}
                        value={tier.priceUsd ? String(tier.priceUsd) : ''}
                        onChangeText={text => handleUpdateTier(index, 'priceUsd', parseFloat(text) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.tierField}>
                      <Text style={styles.tierLabel}>Delivery (days) *</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="0"
                        placeholderTextColor={COLORS.textSecondary}
                        value={tier.deliveryDays ? String(tier.deliveryDays) : ''}
                        onChangeText={text => handleUpdateTier(index, 'deliveryDays', parseInt(text, 10) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.tierField}>
                      <Text style={styles.tierLabel}>Revisions *</Text>
                      <TextInput
                        style={styles.tierInput}
                        placeholder="0"
                        placeholderTextColor={COLORS.textSecondary}
                        value={tier.revisions !== undefined ? String(tier.revisions) : ''}
                        onChangeText={text => handleUpdateTier(index, 'revisions', parseInt(text, 10) || 0)}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.tierFieldFull}>
                    <Text style={styles.tierLabel}>Scope (what is included) *</Text>
                    {exampleScope && (
                      <Text style={styles.helperText}>Example: {exampleScope}</Text>
                    )}
                    <TextInput
                      style={[styles.tierInput, styles.tierTextArea]}
                      placeholder="Describe what is included in this tier"
                      placeholderTextColor={COLORS.textSecondary}
                      value={tier.scope}
                      onChangeText={text => handleUpdateTier(index, 'scope', text)}
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {tier.priceUsd > 0 && (
                    <View style={styles.payoutRow}>
                      <Text style={styles.payoutLabel}>You earn:</Text>
                      <Text style={styles.payoutValue}>${payout.net.toFixed(2)}</Text>
                      <Text style={styles.payoutFee}>(${payout.fee.toFixed(2)} platform fee)</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );

      case 'media':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Photos & Videos</Text>
            <Text style={styles.stepSubtitle}>
              Add at least 1 photo. You can upload up to {limits.maxMedia} files.
            </Text>

            <TouchableOpacity style={styles.addMediaButton} onPress={handleAddMedia}>
              <ImageIcon size={32} color={COLORS.secondary} />
              <Text style={styles.addMediaText}>Add Photo/Video</Text>
              <Text style={styles.addMediaHint}>({media.length} / {limits.maxMedia})</Text>
            </TouchableOpacity>

            <View style={styles.mediaGrid}>
              {media.map(item => (
                <View key={item.id} style={styles.mediaCard}>
                  <View style={[styles.mediaThumbnail, item.cover && styles.mediaCover]}>
                    <Text style={styles.mediaPlaceholder}>📷</Text>
                    {item.cover && (
                      <View style={styles.coverBadge}>
                        <Text style={styles.coverBadgeText}>COVER</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.mediaActions}>
                    {!item.cover && (
                      <TouchableOpacity onPress={() => handleSetCover(item.id)}>
                        <Text style={styles.mediaActionText}>Set Cover</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => handleRemoveMedia(item.id)}>
                      <Text style={[styles.mediaActionText, styles.mediaActionRemove]}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {media.length > 0 && !media.some(m => m.cover) && (
              <Text style={styles.warningText}>⚠️ Select one image as your cover photo</Text>
            )}
          </View>
        );

      case 'area':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Service Area</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Base ZIP Code *</Text>
              <View style={styles.inputWithIcon}>
                <MapPin size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.inputWithIconPadding]}
                  placeholder="12345"
                  placeholderTextColor={COLORS.textSecondary}
                  value={baseZip}
                  onChangeText={setBaseZip}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Service Radius: {radiusMiles} miles</Text>
              <Text style={styles.helperText}>Your KYC tier allows up to {limits.maxRadiusMiles} miles</Text>
              <View style={styles.radiusOptions}>
                {[5, 10, 15, 25, 50].filter(r => r <= limits.maxRadiusMiles).map(r => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.radiusChip, radiusMiles === r && styles.radiusChipActive]}
                    onPress={() => setRadiusMiles(r)}
                  >
                    <Text style={[styles.radiusText, radiusMiles === r && styles.radiusTextActive]}>
                      {r}mi
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Service Type *</Text>
              <View style={styles.toggleRow}>
                <TouchableOpacity
                  style={[styles.toggleOption, onsite && styles.toggleOptionActive]}
                  onPress={() => setOnsite(true)}
                >
                  <Text style={[styles.toggleText, onsite && styles.toggleTextActive]}>On-site</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleOption, !onsite && styles.toggleOptionActive]}
                  onPress={() => setOnsite(false)}
                >
                  <Text style={[styles.toggleText, !onsite && styles.toggleTextActive]}>Remote</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Promo Text (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., First 3 clients — 50% off"
                placeholderTextColor={COLORS.textSecondary}
                value={promoText}
                onChangeText={setPromoText}
                maxLength={60}
              />
              <Text style={styles.charCount}>{promoText.length} / 60</Text>
            </View>
          </View>
        );

      case 'review':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Review & Publish</Text>
            <Text style={styles.stepSubtitle}>Make sure everything looks good before publishing.</Text>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Title</Text>
              <Text style={styles.reviewValue}>{title || '—'}</Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Category</Text>
              <Text style={styles.reviewValue}>
                {selectedCategory?.name || '—'} {subcategory && `• ${subcategory}`}
              </Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Description</Text>
              <Text style={styles.reviewValue} numberOfLines={3}>
                {description || '—'}
              </Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Pricing</Text>
              {tiers.map(tier => (
                <View key={tier.id} style={styles.reviewTierRow}>
                  <Text style={styles.reviewTierName}>{tier.name}:</Text>
                  <Text style={styles.reviewTierPrice}>${tier.priceUsd}</Text>
                  <Text style={styles.reviewTierDetail}>
                    • {tier.deliveryDays}d • {tier.revisions} rev
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Media</Text>
              <Text style={styles.reviewValue}>{media.length} file(s)</Text>
            </View>

            <View style={styles.reviewCard}>
              <Text style={styles.reviewLabel}>Service Area</Text>
              <Text style={styles.reviewValue}>
                ZIP {baseZip || '—'} • {radiusMiles}mi radius • {onsite ? 'On-site' : 'Remote'}
              </Text>
            </View>

            <View style={styles.policyBox}>
              <CheckCircle size={20} color={COLORS.secondary} />
              <Text style={styles.policyText}>
                By publishing, you agree to complete jobs through the HustleXP platform and escrow system.
              </Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Create Offer',
          headerStyle: { backgroundColor: COLORS.background },
          headerTintColor: COLORS.text,
        }}
      />

      <View style={styles.stepper}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.stepItem}>
            <View style={styles.stepIndicator}>
              {index < currentStepIndex ? (
                <CheckCircle size={24} color={COLORS.secondary} />
              ) : index === currentStepIndex ? (
                <View style={[styles.stepCircle, styles.stepCircleActive]}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
              ) : (
                <View style={styles.stepCircle}>
                  <Text style={styles.stepNumber}>{index + 1}</Text>
                </View>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                index === currentStepIndex && styles.stepLabelActive,
              ]}
            >
              {STEP_LABELS[step]}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderStepContent()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isSubmitting}>
          <ArrowLeft size={20} color={COLORS.text} />
          <Text style={styles.backButtonText}>{currentStepIndex === 0 ? 'Cancel' : 'Back'}</Text>
        </TouchableOpacity>

        {currentStep === 'review' ? (
          <View style={styles.finalActions}>
            <TouchableOpacity
              style={styles.draftButton}
              onPress={handleSaveDraft}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.textSecondary} />
              ) : (
                <Text style={styles.draftButtonText}>Save Draft</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.publishButton}
              onPress={handlePublish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.publishButtonText}>Publish</Text>
                  <CheckCircle size={20} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={isSubmitting}>
            <Text style={styles.nextButtonText}>Next</Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  stepper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  stepIndicator: {
    marginBottom: 6,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  stepLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: COLORS.secondary,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stepContent: {
    padding: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'right',
  },
  categoryScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: COLORS.secondary + '20',
    borderColor: COLORS.secondary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.secondary,
    fontWeight: '600' as const,
  },
  subChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  subChipActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  subText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  subTextActive: {
    color: COLORS.primary,
    fontWeight: '600' as const,
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
  },
  addButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#000',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  tagText: {
    fontSize: 13,
    color: COLORS.text,
  },
  tagRemove: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  tierCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tierName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 12,
  },
  tierRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  tierField: {
    flex: 1,
  },
  tierFieldFull: {
    marginBottom: 12,
  },
  tierLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  tierInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },
  tierTextArea: {
    height: 80,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontStyle: 'italic' as const,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 8,
  },
  payoutLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  payoutValue: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.success,
  },
  payoutFee: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  addMediaButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    borderStyle: 'dashed' as const,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  addMediaText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
    marginTop: 8,
  },
  addMediaHint: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  mediaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  mediaCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  mediaThumbnail: {
    height: 120,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mediaCover: {
    borderWidth: 3,
    borderColor: COLORS.secondary,
  },
  mediaPlaceholder: {
    fontSize: 32,
  },
  coverBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: '#000',
  },
  mediaActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  mediaActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.secondary,
  },
  mediaActionRemove: {
    color: COLORS.error,
  },
  warningText: {
    fontSize: 13,
    color: COLORS.warning,
    marginTop: 12,
    textAlign: 'center',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: 12,
    zIndex: 1,
  },
  inputWithIconPadding: {
    paddingLeft: 42,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  radiusChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  radiusChipActive: {
    backgroundColor: COLORS.secondary + '20',
    borderColor: COLORS.secondary,
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: COLORS.textSecondary,
  },
  radiusTextActive: {
    color: COLORS.secondary,
    fontWeight: '700' as const,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  toggleOptionActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
  },
  toggleTextActive: {
    color: COLORS.primary,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase' as const,
  },
  reviewValue: {
    fontSize: 15,
    color: COLORS.text,
  },
  reviewTierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  reviewTierName: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: COLORS.text,
    width: 80,
  },
  reviewTierPrice: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: COLORS.success,
  },
  reviewTierDetail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  policyBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.secondary + '10',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    gap: 10,
  },
  policyText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000',
  },
  finalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  draftButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  draftButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  publishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8,
  },
  publishButtonText: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#000',
  },
});
