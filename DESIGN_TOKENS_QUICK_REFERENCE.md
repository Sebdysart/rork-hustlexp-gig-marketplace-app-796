# HustleXP Design Tokens - Quick Reference Guide

**Last Updated:** 2025-10-15  
**Source:** `constants/designTokens.ts`

---

## 🎨 Colors

### Core Colors
```typescript
import Colors from '@/constants/colors';

Colors.primary      // #9B5EFF (Purple)
Colors.secondary    // #00FFFF (Cyan)
Colors.accent       // #FFB800 (Amber)
Colors.background   // #0D0D0F (Deep Black)
Colors.surface      // #1A1A1A (Charcoal)
Colors.card         // #252525 (Dark Gray)
Colors.text         // #FFFFFF (White)
Colors.textSecondary // #A0A0A0 (Gray)
Colors.success      // #00FF88 (Green)
Colors.error        // #FF00A8 (Magenta)
Colors.warning      // #FFB800 (Amber)
Colors.info         // #00FFFF (Cyan)
Colors.border       // rgba(255, 255, 255, 0.1)
```

### Premium Neon Colors
```typescript
import { premiumColors } from '@/constants/designTokens';

premiumColors.neonCyan      // #00FFFF
premiumColors.neonMagenta   // #FF00A8
premiumColors.neonAmber     // #FFB800
premiumColors.neonViolet    // #9B5EFF
premiumColors.neonGreen     // #00FF88
premiumColors.neonBlue      // #5271FF
premiumColors.neonPurple    // #A855F7
premiumColors.neonOrange    // #FF6B35
premiumColors.deepBlack     // #0D0D0F
premiumColors.richBlack     // #121212
premiumColors.charcoal      // #1A1A1A
premiumColors.gritGold      // #FFD700
```

### Rarity Colors
```typescript
Colors.rarity.common     // #9CA3AF (Gray)
Colors.rarity.rare       // #3B82F6 (Blue)
Colors.rarity.epic       // #A855F7 (Purple)
Colors.rarity.legendary  // #F59E0B (Gold)
```

---

## 📏 Spacing (8pt Grid)

```typescript
import { spacing } from '@/constants/designTokens';

spacing.xs    // 4px  - Micro gaps, tight padding
spacing.sm    // 8px  - Small badges, pills, gaps
spacing.md    // 12px - Card sections, medium gaps
spacing.lg    // 16px - Card padding, standard margins
spacing.xl    // 24px - Screen padding, large gaps
spacing.xxl   // 32px - Section spacing
spacing.xxxl  // 48px - Major section breaks
```

### Usage Examples
```typescript
// Card padding
padding: spacing.lg,

// Section margins
marginBottom: spacing.xl,

// Badge gaps
gap: spacing.sm,

// Pill padding
paddingHorizontal: spacing.sm,
paddingVertical: spacing.xs,
```

---

## 🔲 Border Radius

```typescript
import { borderRadius } from '@/constants/designTokens';

borderRadius.sm   // 8px  - Pills, tags, small badges
borderRadius.md   // 12px - Badges, medium cards
borderRadius.lg   // 16px - Large cards, buttons
borderRadius.xl   // 20px - Extra large buttons
borderRadius.xxl  // 24px - Hero cards
borderRadius.full // 9999px - Circular elements
```

---

## 📝 Typography

### Font Sizes
```typescript
import { typography } from '@/constants/designTokens';

typography.sizes.xs      // 11px - Micro text
typography.sizes.sm      // 12px - Small labels
typography.sizes.base    // 14px - Body text
typography.sizes.md      // 16px - Medium text
typography.sizes.lg      // 18px - Large text
typography.sizes.xl      // 20px - Headings
typography.sizes.xxl     // 24px - Large headings
typography.sizes.xxxl    // 28px - Hero headings
typography.sizes.display // 32px - Display text
typography.sizes.hero    // 40px - Hero text
```

### Font Weights
```typescript
typography.weights.regular  // '400'
typography.weights.medium   // '500'
typography.weights.semibold // '600'
typography.weights.bold     // '700'
typography.weights.heavy    // '800'
```

### Line Heights
```typescript
typography.lineHeights.tight   // 1.2
typography.lineHeights.normal  // 1.5
typography.lineHeights.relaxed // 1.75
```

---

## ✨ Neon Glow Effects

```typescript
import { neonGlow } from '@/constants/designTokens';

// Apply to style objects
...neonGlow.cyan     // Cyan glow
...neonGlow.magenta  // Magenta glow
...neonGlow.amber    // Amber glow
...neonGlow.violet   // Violet glow
...neonGlow.green    // Green glow
...neonGlow.blue     // Blue glow
...neonGlow.subtle   // Subtle white glow
```

### Example
```typescript
const styles = StyleSheet.create({
  badge: {
    backgroundColor: premiumColors.neonCyan + '20',
    ...neonGlow.cyan,
  },
});
```

---

## 🌈 Gradients

```typescript
import { gradients } from '@/constants/designTokens';

// XP Bar
gradients.xpBar // ['#5271FF', '#9B5EFF', '#FF00A8']

// Level Up
gradients.levelUp // ['#FFD700', '#FF6B35', '#FF00A8']

// Grit Coin
gradients.gritCoin // ['#FFD700', '#FFA500', '#FF8C00']

// Verified Badge
gradients.verified // ['#00FF88', '#00FFFF']

// Premium
gradients.premium // ['#FFD700', '#FF00A8', '#9B5EFF']
```

### Usage with LinearGradient
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/constants/designTokens';

<LinearGradient
  colors={gradients.xpBar}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 0 }}
  style={styles.bar}
/>
```

---

## 🎭 Glassmorphism

```typescript
import { glassmorphism } from '@/constants/designTokens';

// Apply to style objects
...glassmorphism.light      // Light glass effect
...glassmorphism.medium     // Medium glass effect
...glassmorphism.dark       // Dark glass effect
...glassmorphism.darkStrong // Strong dark glass
```

---

## 🔔 Icon Sizes

```typescript
import { iconSizes } from '@/constants/designTokens';

iconSizes.xs   // 12px
iconSizes.sm   // 16px
iconSizes.md   // 20px
iconSizes.lg   // 24px
iconSizes.xl   // 32px
iconSizes.xxl  // 48px
iconSizes.xxxl // 64px
```

---

## ⏱️ Transitions

```typescript
import { transitions } from '@/constants/designTokens';

transitions.fast     // 150ms
transitions.normal   // 250ms
transitions.slow     // 350ms
transitions.verySlow // 500ms
```

### Usage with Animated
```typescript
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: transitions.normal,
  useNativeDriver: true,
}).start();
```

---

## 🎯 Common Patterns

### Card with Glow
```typescript
const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: premiumColors.charcoal,
    ...neonGlow.subtle,
  },
});
```

### Badge with Neon
```typescript
const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: premiumColors.neonCyan + '20',
    borderWidth: 1,
    borderColor: premiumColors.neonCyan + '40',
    ...neonGlow.cyan,
  },
});
```

### Pill/Tag
```typescript
const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: Colors.surface,
  },
});
```

### Button
```typescript
const styles = StyleSheet.create({
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
    backgroundColor: premiumColors.neonViolet,
    ...neonGlow.violet,
  },
});
```

---

## ♿ Accessibility Patterns

### Button
```typescript
<TouchableOpacity
  accessible={true}
  accessibilityRole="button"
  accessibilityLabel="Accept Task"
  accessibilityHint="Double tap to accept this task"
  accessibilityState={{ disabled: false }}
>
```

### Progress Bar
```typescript
<View
  accessible={true}
  accessibilityRole="progressbar"
  accessibilityLabel={`Level ${level}. ${currentXP} out of ${nextLevelXP} XP. ${progress}% complete.`}
>
```

### Badge/Image
```typescript
<View
  accessible={true}
  accessibilityRole="image"
  accessibilityLabel="Level 10 badge"
>
```

---

## 🚀 Migration Guide

### Before (Magic Numbers)
```typescript
const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 14,
    backgroundColor: '#1A1A1A',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
});
```

### After (Design Tokens)
```typescript
import { spacing, borderRadius, premiumColors } from '@/constants/designTokens';

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: premiumColors.charcoal,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
  },
});
```

---

## 📦 Import Cheat Sheet

```typescript
// Colors (legacy compatible)
import Colors from '@/constants/colors';

// All design tokens
import {
  spacing,
  typography,
  borderRadius,
  elevation,
  glassmorphism,
  neonGlow,
  iconSizes,
  transitions,
  premiumColors,
  gradients,
  animations,
  COLORS, // Alternative color object
} from '@/constants/designTokens';
```

---

## 🎨 Color Combinations

### Success States
```typescript
backgroundColor: premiumColors.neonGreen + '20',
borderColor: premiumColors.neonGreen + '40',
color: Colors.success,
```

### Warning States
```typescript
backgroundColor: premiumColors.neonAmber + '20',
borderColor: premiumColors.neonAmber + '40',
color: Colors.warning,
```

### Error States
```typescript
backgroundColor: premiumColors.neonMagenta + '20',
borderColor: premiumColors.neonMagenta + '40',
color: Colors.error,
```

### Info States
```typescript
backgroundColor: premiumColors.neonCyan + '20',
borderColor: premiumColors.neonCyan + '40',
color: Colors.info,
```

---

**Pro Tip:** Always use design tokens instead of hardcoded values. This ensures consistency, makes theming easier, and speeds up development!
