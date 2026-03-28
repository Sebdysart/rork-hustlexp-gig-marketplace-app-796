import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfferDraft } from '@/types';
import { getOfferLimits, validateOfferDraft, ValidationResult } from '@/utils/offerValidation';

const OFFERS_STORAGE_KEY = '@hustlexp:offers';

export const [OfferContext, useOffers] = createContextHook(() => {
  const [offers, setOffers] = useState<OfferDraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userVerifications, setUserVerifications] = useState<string[]>([]);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(OFFERS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setOffers(parsed);
      }
    } catch (error) {
      console.error('[OfferContext] Failed to load offers:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveOffers = async (updatedOffers: OfferDraft[]) => {
    try {
      await AsyncStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(updatedOffers));
      setOffers(updatedOffers);
    } catch (error) {
      console.error('[OfferContext] Failed to save offers:', error);
      throw error;
    }
  };

  const createOffer = useCallback(async (draft: Omit<OfferDraft, 'offerId' | 'createdAt' | 'updatedAt'>): Promise<OfferDraft> => {
    const newOffer: OfferDraft = {
      ...draft,
      offerId: `offer-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewCount: 0,
      matchCount: 0,
    };

    const updated = [...offers, newOffer];
    await saveOffers(updated);
    return newOffer;
  }, [offers]);

  const updateOffer = useCallback(async (offerId: string, updates: Partial<OfferDraft>): Promise<void> => {
    const updated = offers.map(offer =>
      offer.offerId === offerId
        ? { ...offer, ...updates, updatedAt: new Date().toISOString() }
        : offer
    );
    await saveOffers(updated);
  }, [offers]);

  const deleteOffer = useCallback(async (offerId: string): Promise<void> => {
    const updated = offers.filter(offer => offer.offerId !== offerId);
    await saveOffers(updated);
  }, [offers]);

  const publishOffer = useCallback(async (offerId: string): Promise<void> => {
    const offer = offers.find(o => o.offerId === offerId);
    if (!offer) throw new Error('Offer not found');

    const limits = getOfferLimits(userVerifications);
    const validation = validateOfferDraft(offer, limits);
    
    if (!validation.valid) {
      throw new Error(`Validation failed: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    const activeCount = offers.filter(o => o.status === 'published' && o.offerId !== offerId).length;
    if (activeCount >= limits.maxActiveOffers) {
      throw new Error(`You can only have ${limits.maxActiveOffers} active offers with your current KYC tier`);
    }

    await updateOffer(offerId, { 
      status: 'published',
      kycTierAtPublish: getUserKYCTierName(userVerifications),
    });
  }, [offers, updateOffer, userVerifications]);

  const pauseOffer = useCallback(async (offerId: string): Promise<void> => {
    await updateOffer(offerId, { status: 'paused' });
  }, [updateOffer]);

  const getUserKYCTierName = (verifications: string[]): 'Basic' | 'Verified' | 'Pro' => {
    if (verifications.includes('kyc_elite')) return 'Pro';
    if (verifications.includes('kyc_premium')) return 'Pro';
    if (verifications.includes('kyc_standard')) return 'Verified';
    return 'Basic';
  };

  const offersByStatus = useMemo(() => {
    return {
      draft: offers.filter(o => o.status === 'draft'),
      published: offers.filter(o => o.status === 'published'),
      paused: offers.filter(o => o.status === 'paused'),
    };
  }, [offers]);

  const limits = useMemo(() => getOfferLimits(userVerifications), [userVerifications]);

  const validateOffer = useCallback((draft: Partial<OfferDraft>): ValidationResult => 
    validateOfferDraft(draft, limits), [limits]);

  return useMemo(() => ({
    offers,
    offersByStatus,
    isLoading,
    limits,
    userVerifications,
    setUserVerifications,
    createOffer,
    updateOffer,
    deleteOffer,
    publishOffer,
    pauseOffer,
    validateOffer,
  }), [offers, offersByStatus, isLoading, limits, userVerifications, createOffer, updateOffer, deleteOffer, publishOffer, pauseOffer, validateOffer]);
});

export function useOfferById(offerId: string) {
  const { offers } = useOffers();
  return useMemo(() => offers.find(o => o.offerId === offerId), [offers, offerId]);
}

export function useActiveOffersCount() {
  const { offersByStatus } = useOffers();
  return offersByStatus.published.length;
}
