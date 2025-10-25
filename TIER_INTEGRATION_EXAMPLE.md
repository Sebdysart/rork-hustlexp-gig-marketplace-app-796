# ASCENSION TIER SYSTEM - INTEGRATION EXAMPLES

Copy these code snippets to integrate the tier system into your app.
Total integration time: ~30 minutes

## 1. UPDATE AppContext.tsx

```typescript
import { getTierForLevel, AscensionTier } from '@/constants/ascensionTiers';
import { calculateTierBonusXP } from '@/hooks/useAscensionTier';

// Add to state:
const [showAscension, setShowAscension] = useState<{
  tier: AscensionTier;
  level: number;
} | null>(null);

// Update completeTask function:
const completeTask = useCallback(async (taskId: string) => {
  if (!currentUser) return;

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  // ... existing code ...

  const oldLevel = currentUser.level;
  const oldTier = getTierForLevel(oldLevel);

  // Apply tier XP multiplier
  const baseXP = task.xpReward;
  const tierBonusXP = calculateTierBonusXP(baseXP, currentUser.level);
  const newXP = currentUser.xp + tierBonusXP;

  const newLevel = calculateLevel(newXP);
  const newTier = getTierForLevel(newLevel);
  const leveledUp = newLevel > oldLevel;
  const tierChanged = oldTier.id !== newTier.id;

  // ... update user ...

  // Check for tier transition
  if (leveledUp && tierChanged) {
    // Show Ascension Ceremony!
    setShowAscension({ tier: newTier, level: newLevel });
  } else if (leveledUp) {
    // Regular level up (same tier)
    if (addNotification) {
      addNotification(currentUser.id, 'level_up', { newLevel });
    }
  }

  console.log(`Task completed. Base XP: ${baseXP}, Tier Bonus: ${tierBonusXP} (${oldTier.xpMultiplier}x)`);

  return { leveledUp, newLevel, tierChanged };
}, [currentUser, tasks, updateUser, addNotification]);

// Add to return value:
return useMemo(() => ({
  // ... existing exports ...
  showAscension,
  setShowAscension,
}), [
  // ... existing deps ...
  showAscension,
  setShowAscension,
]);
```

## 2. UPDATE app/_layout.tsx

```typescript
import AscensionCeremony from '@/components/AscensionCeremony';
import { useApp } from '@/contexts/AppContext';

export default function RootLayout() {
  const { showAscension, setShowAscension } = useApp();

  return (
    <>
      <Stack>
        {/* Your existing routes */}
      </Stack>

      {/* Tier System Overlay */}
      {showAscension && (
        <AscensionCeremony
          tier={showAscension.tier}
          newLevel={showAscension.level}
          onComplete={() => setShowAscension(null)}
        />
      )}
    </>
  );
}
```

## 3. ADD TO Profile Screen

```typescript
import TierProgressIndicator from '@/components/TierProgressIndicator';
import TierBadge from '@/components/TierBadge';
import { useApp } from '@/contexts/AppContext';
import { useAscensionTier } from '@/hooks/useAscensionTier';

export default function ProfileScreen() {
  const { currentUser } = useApp();
  const tierData = useAscensionTier(currentUser?.level || 1);

  return (
    <ScrollView>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: currentUser?.profilePic }} style={styles.avatar} />
          {/* Tier Badge Overlay */}
          <View style={styles.tierBadgePosition}>
            <TierBadge level={currentUser?.level || 1} size="medium" />
          </View>
        </View>
        <Text style={styles.name}>{currentUser?.name}</Text>
        <Text style={styles.tierName}>{tierData.currentTier.name}</Text>
      </View>

      {/* Tier Progress */}
      <TierProgressIndicator 
        currentLevel={currentUser?.level || 1}
        currentXP={currentUser?.xp || 0}
      />

      {/* Current Benefits */}
      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>Your Tier Benefits</Text>
        <View style={styles.benefitsList}>
          <Text style={styles.benefit}>⚡ {tierData.xpMultiplier}x XP Multiplier</Text>
          <Text style={styles.benefit}>💰 {tierData.platformFee}% Platform Fee</Text>
          <Text style={styles.benefit}>🎯 {tierData.priorityMatching} Matching</Text>
        </View>
      </View>

      {/* Rest of profile */}
    </ScrollView>
  );
}
```

## 4. ADD TO Home Screen Header

```typescript
import TierProgressIndicator from '@/components/TierProgressIndicator';
import TierUpgradeBanner from '@/components/TierUpgradeBanner';
import { useApp } from '@/contexts/AppContext';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { currentUser } = useApp();
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header with compact tier indicator */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back, {currentUser?.name}!</Text>
        <TierProgressIndicator 
          currentLevel={currentUser?.level || 1}
          currentXP={currentUser?.xp || 0}
          compact
        />
      </View>

      {/* Near-tier banner (only shows if 80%+ to next tier) */}
      <TierUpgradeBanner
        currentLevel={currentUser?.level || 1}
        onViewDetails={() => router.push('/profile')}
      />

      {/* Rest of home screen */}
    </View>
  );
}
```

## 5. ADD TO Task Completion Screen

```typescript
import { useAscensionTier, calculateTierBonusXP } from '@/hooks/useAscensionTier';
import { useApp } from '@/contexts/AppContext';

export default function TaskCompleteScreen() {
  const { currentUser } = useApp();
  const tierData = useAscensionTier(currentUser?.level || 1);
  const task = { xpReward: 100, payAmount: 150 }; // Replace with actual task data

  const baseXP = task.xpReward;
  const bonusXP = calculateTierBonusXP(baseXP, currentUser?.level || 1);

  return (
    <View>
      {/* Success message */}
      <Text style={styles.title}>Task Completed! 🎉</Text>

      {/* XP Breakdown */}
      <View style={styles.xpCard}>
        <Text style={styles.xpLabel}>XP Earned</Text>
        <Text style={styles.xpValue}>+{bonusXP}</Text>
        {tierData.xpMultiplier > 1 && (
          <Text style={styles.xpBonus}>
            ({baseXP} base × {tierData.xpMultiplier}x tier bonus)
          </Text>
        )}
      </View>

      {/* Payment Info */}
      <View style={styles.paymentCard}>
        <Text style={styles.paymentLabel}>You Earned</Text>
        <Text style={styles.paymentValue}>${task.payAmount.toFixed(2)}</Text>
        <Text style={styles.feeInfo}>
          Platform fee: {tierData.platformFee}% (${(task.payAmount * tierData.platformFee / 100).toFixed(2)})
        </Text>
      </View>
    </View>
  );
}
```

## 6. ADD TO Leaderboard

```typescript
import TierBadge from '@/components/TierBadge';

export default function LeaderboardScreen() {
  const { leaderboard } = useApp();

  return (
    <FlatList
      data={leaderboard}
      renderItem={({ item }) => (
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: item.profilePic }} style={styles.avatar} />
            {/* Tier badge overlay */}
            <View style={styles.badgeOverlay}>
              <TierBadge level={item.level} size="small" />
            </View>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userStats}>
              Level {item.level} · {item.tasksCompleted} tasks
            </Text>
          </View>
          <Text style={styles.xpValue}>{item.xp.toLocaleString()} XP</Text>
        </View>
      )}
    />
  );
}
```

## 7. ADD TO Task Cards (Poster/Worker Badge)

```typescript
import TierBadge from '@/components/TierBadge';

export default function TaskCard({ task }: { task: Task }) {
  const { users } = useApp();
  const poster = users.find(u => u.id === task.posterId);

  return (
    <View style={styles.card}>
      <View style={styles.posterInfo}>
        <Image source={{ uri: poster?.profilePic }} style={styles.posterAvatar} />
        <TierBadge level={poster?.level || 1} size="small" showLevel={false} />
        <Text style={styles.posterName}>{poster?.name}</Text>
      </View>

      {/* Rest of task card */}
    </View>
  );
}
```

## 8. ADD TO Post Task Screen (Show Fee)

```typescript
import { useAscensionTier, calculateTierPlatformFee } from '@/hooks/useAscensionTier';

export default function PostTaskScreen() {
  const { currentUser } = useApp();
  const tierData = useAscensionTier(currentUser?.level || 1);
  const [amount, setAmount] = useState(100);

  const platformFee = calculateTierPlatformFee(amount, currentUser?.level || 1);
  const netAmount = amount - platformFee;

  return (
    <View>
      {/* Amount input */}
      <TextInput
        value={amount.toString()}
        onChangeText={(text) => setAmount(parseFloat(text) || 0)}
        keyboardType="numeric"
      />

      {/* Fee breakdown */}
      <View style={styles.feeCard}>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>Task Amount</Text>
          <Text style={styles.feeValue}>${amount.toFixed(2)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabel}>
            Platform Fee ({tierData.platformFee}%)
          </Text>
          <Text style={styles.feeValue}>-${platformFee.toFixed(2)}</Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={styles.feeLabelTotal}>Worker Receives</Text>
          <Text style={styles.feeValueTotal}>${netAmount.toFixed(2)}</Text>
        </View>

        {tierData.platformFee < 15 && (
          <Text style={styles.savingsMessage}>
            💰 You save {15 - tierData.platformFee}% with {tierData.currentTier.name} tier!
          </Text>
        )}
      </View>
    </View>
  );
}
```

## 9. ADD Push Notification (Optional)

```typescript
import { isNearNextTier, getNextTier, getLevelsUntilNextTier } from '@/constants/ascensionTiers';

// In your notification service:
export function checkTierProximityNotification(userId: string, level: number) {
  if (isNearNextTier(level, 0.9)) { // 90% threshold
    const nextTier = getNextTier(level);
    const levelsRemaining = getLevelsUntilNextTier(level);

    if (nextTier && levelsRemaining <= 2) {
      // Send push notification
      sendPushNotification(userId, {
        title: `🎯 ${levelsRemaining} ${levelsRemaining === 1 ? 'level' : 'levels'} to ${nextTier.name}!`,
        body: `Complete one more task to unlock ${nextTier.name} tier and get ${nextTier.xpMultiplier}x XP boost!`,
        data: { type: 'tier_proximity', nextTierId: nextTier.id },
      });
    }
  }
}
```

## 10. STYLE EXAMPLES

```typescript
const styles = StyleSheet.create({
  // Profile tier badge position (overlay on avatar)
  tierBadgePosition: {
    position: 'absolute',
    bottom: -4,
    right: -4,
  },

  // Leaderboard badge overlay
  badgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
  },

  // Benefits card
  benefitsCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  benefitsList: {
    gap: 8,
  },
  benefit: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },

  // Fee card
  feeCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginTop: 12,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  feeLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  feeLabelTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feeValueTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#10B981',
  },
  savingsMessage: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#FCD34D',
    textAlign: 'center',
  },
});
```

## TESTING CHECKLIST

### ✅ Manual Tests:
1. Navigate to /tier-demo
2. Test levels: 1, 10, 11, 20, 21, 30, 31, 40, 41
3. Verify near-tier glow at levels 9, 19, 29, 39
4. Preview all tier ceremonies
5. Check profile shows correct tier
6. Complete task at level 10 → verify ceremony triggers
7. Complete task at level 15 → verify NO ceremony
8. Verify XP multiplier applies (check console logs)
9. Verify platform fee displays correctly
10. Test on iOS, Android, Web

### ✅ Edge Cases:
- Level 1 (no near-tier glow)
- Level 999 (max tier)
- Ceremony dismissal
- Progress bar at 0% and 100%
- Badges at all sizes

### ✅ Integration:
- AppContext exports showAscension
- Root layout renders AscensionCeremony
- Profile shows tier progress
- Home shows compact indicator + banner
- Task completion shows XP bonus
- Leaderboard shows tier badges
- Task cards show poster tier badge
- Post task shows fee with tier discount
