import { OfferDraft, OfferLimits } from '@/types';
import { getUserKYCTier } from '@/constants/kycTiers';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export function getOfferLimits(verifications: string[] = []): OfferLimits {
  const kycTier = getUserKYCTier(verifications);
  
  switch (kycTier.id) {
    case 'unverified':
      return {
        maxActiveOffers: 0,
        maxMedia: 0,
        maxRadiusMiles: 0,
        canAddRushDelivery: false,
        canAddAddOns: false,
        platformFeePercent: 15,
      };
    case 'lite':
      return {
        maxActiveOffers: 1,
        maxMedia: 4,
        maxRadiusMiles: 15,
        canAddRushDelivery: false,
        canAddAddOns: false,
        platformFeePercent: 12,
      };
    case 'standard':
      return {
        maxActiveOffers: 3,
        maxMedia: 8,
        maxRadiusMiles: 50,
        canAddRushDelivery: false,
        canAddAddOns: true,
        platformFeePercent: 10,
      };
    case 'premium':
      return {
        maxActiveOffers: 5,
        maxMedia: 8,
        maxRadiusMiles: 50,
        canAddRushDelivery: true,
        canAddAddOns: true,
        platformFeePercent: 8,
      };
    case 'elite':
      return {
        maxActiveOffers: 10,
        maxMedia: 8,
        maxRadiusMiles: 100,
        canAddRushDelivery: true,
        canAddAddOns: true,
        platformFeePercent: 0,
      };
    default:
      return {
        maxActiveOffers: 1,
        maxMedia: 4,
        maxRadiusMiles: 15,
        canAddRushDelivery: false,
        canAddAddOns: false,
        platformFeePercent: 12,
      };
  }
}

export function validateOfferDraft(draft: Partial<OfferDraft>, limits: OfferLimits): ValidationResult {
  const errors: ValidationError[] = [];

  if (!draft.title || draft.title.length < 8) {
    errors.push({ field: 'title', message: 'Title must be at least 8 characters' });
  }
  if (draft.title && draft.title.length > 80) {
    errors.push({ field: 'title', message: 'Title must be less than 80 characters' });
  }

  if (!draft.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  if (!draft.description || draft.description.length < 40) {
    errors.push({ field: 'description', message: 'Description must be at least 40 characters' });
  }
  if (draft.description && draft.description.length > 1200) {
    errors.push({ field: 'description', message: 'Description must be less than 1200 characters' });
  }

  if (draft.tags && draft.tags.length > 8) {
    errors.push({ field: 'tags', message: 'Maximum 8 tags allowed' });
  }

  if (!draft.tiers || draft.tiers.length !== 3) {
    errors.push({ field: 'tiers', message: 'Exactly 3 tiers required (Starter, Standard, Pro)' });
  } else {
    draft.tiers.forEach((tier, index) => {
      if (tier.priceUsd < 25) {
        errors.push({ field: `tiers.${index}.price`, message: 'Minimum price is $25' });
      }
      if (tier.deliveryDays < 1 || tier.deliveryDays > 14) {
        errors.push({ field: `tiers.${index}.delivery`, message: 'Delivery must be 1-14 days' });
      }
      if (tier.revisions < 0 || tier.revisions > 3) {
        errors.push({ field: `tiers.${index}.revisions`, message: 'Revisions must be 0-3' });
      }
      if (!tier.scope || tier.scope.length < 20) {
        errors.push({ field: `tiers.${index}.scope`, message: 'Scope must be at least 20 characters' });
      }
    });
  }

  if (!draft.media || draft.media.length < 1) {
    errors.push({ field: 'media', message: 'At least 1 photo or video required' });
  }
  if (draft.media && draft.media.length > limits.maxMedia) {
    errors.push({ field: 'media', message: `Maximum ${limits.maxMedia} media files allowed` });
  }
  if (draft.media && draft.status === 'published') {
    const hasCover = draft.media.some(m => m.cover);
    if (!hasCover) {
      errors.push({ field: 'media', message: 'One media file must be marked as cover' });
    }
  }

  if (!draft.baseZip || !/^\d{5}$/.test(draft.baseZip)) {
    errors.push({ field: 'baseZip', message: 'Valid 5-digit ZIP code required' });
  }

  if (draft.radiusMiles !== undefined) {
    if (draft.radiusMiles < 5 || draft.radiusMiles > limits.maxRadiusMiles) {
      errors.push({ 
        field: 'radiusMiles', 
        message: `Radius must be 5-${limits.maxRadiusMiles} miles for your KYC tier` 
      });
    }
  }

  if (draft.onsite === undefined) {
    errors.push({ field: 'onsite', message: 'Service type (on-site/remote) is required' });
  }

  if (draft.availability) {
    draft.availability.forEach((slot, index) => {
      if (slot.day < 0 || slot.day > 6) {
        errors.push({ field: `availability.${index}.day`, message: 'Day must be 0-6 (Sun-Sat)' });
      }
      if (!/^\d{2}:\d{2}$/.test(slot.start) || !/^\d{2}:\d{2}$/.test(slot.end)) {
        errors.push({ field: `availability.${index}.time`, message: 'Time must be in HH:MM format' });
      }
    });
  }

  if (draft.promoText && draft.promoText.length > 60) {
    errors.push({ field: 'promoText', message: 'Promo text must be less than 60 characters' });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function calculateOfferPayout(priceUsd: number, platformFeePercent: number): {
  gross: number;
  fee: number;
  net: number;
} {
  const fee = priceUsd * (platformFeePercent / 100);
  const net = priceUsd - fee;
  
  return {
    gross: priceUsd,
    fee,
    net,
  };
}

export function sanitizeOfferDescription(description: string): string {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  
  let sanitized = description.replace(phoneRegex, '[PHONE REDACTED]');
  sanitized = sanitized.replace(emailRegex, '[EMAIL REDACTED]');
  
  return sanitized;
}

export function generateOfferSlug(title: string, offerId: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
  
  return `${slug}-${offerId.substring(0, 8)}`;
}
