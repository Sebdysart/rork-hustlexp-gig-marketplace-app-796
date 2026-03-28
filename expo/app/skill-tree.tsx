import React, { useState } from 'react';
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
import { useApp } from '@/contexts/AppContext';
import { SKILL_TREE, canUnlockSkill, SkillNode } from '@/constants/skillTree';
import { LinearGradient } from 'expo-linear-gradient';

export default function SkillTreeScreen() {
  const router = useRouter();
  const { currentUser, updateUser } = useApp();
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>(
    currentUser?.skills || []
  );

  const categories: { id: SkillNode['category']; name: string; color: [string, string] }[] = [
    { id: 'efficiency', name: 'Efficiency', color: ['#8B5CF6', '#6366F1'] },
    { id: 'earnings', name: 'Earnings', color: ['#10B981', '#059669'] },
    { id: 'reputation', name: 'Reputation', color: ['#F59E0B', '#D97706'] },
    { id: 'social', name: 'Social', color: ['#EC4899', '#DB2777'] },
  ];

  const handleUnlockSkill = async (skill: SkillNode) => {
    if (!currentUser) return;

    const canUnlock = canUnlockSkill(
      skill,
      currentUser.level,
      currentUser.xp,
      unlockedSkills
    );

    if (!canUnlock) {
      if (currentUser.level < skill.requiredLevel) {
        Alert.alert(
          'Level Required',
          `Reach level ${skill.requiredLevel} to unlock this skill!`,
          [{ text: 'OK' }]
        );
      } else if (currentUser.xp < skill.cost) {
        Alert.alert(
          'Not Enough XP',
          `You need ${skill.cost} XP to unlock this skill. You have ${currentUser.xp} XP.`,
          [{ text: 'OK' }]
        );
      } else {
        const missingSkills = skill.requiredSkills.filter(
          id => !unlockedSkills.includes(id)
        );
        const missingNames = missingSkills
          .map(id => SKILL_TREE.find(s => s.id === id)?.name)
          .join(', ');
        Alert.alert(
          'Prerequisites Required',
          `You must unlock ${missingNames} first!`,
          [{ text: 'OK' }]
        );
      }
      return;
    }

    Alert.alert(
      'Unlock Skill?',
      `Unlock "${skill.name}" for ${skill.cost} XP?\n\n${skill.description}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unlock',
          onPress: async () => {
            const newUnlockedSkills = [...unlockedSkills, skill.id];
            setUnlockedSkills(newUnlockedSkills);

            const updatedUser = {
              ...currentUser,
              xp: currentUser.xp - skill.cost,
              skills: newUnlockedSkills,
            };

            await updateUser(updatedUser);

            Alert.alert('Success!', `${skill.name} unlocked!`, [{ text: 'OK' }]);
          },
        },
      ]
    );
  };

  const isSkillUnlocked = (skillId: string) => unlockedSkills.includes(skillId);

  const getSkillsByCategory = (category: SkillNode['category']) => {
    return SKILL_TREE.filter(skill => skill.category === category);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Skill Tree',
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
        <View style={styles.header}>
          <Text style={styles.title}>Skill Tree</Text>
          <Text style={styles.subtitle}>
            Unlock passive boosts to enhance your hustle
          </Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpText}>Available XP: {currentUser?.xp || 0}</Text>
          </View>
        </View>

        {categories.map((category) => {
          const skills = getSkillsByCategory(category.id);
          const tierGroups = [1, 2, 3].map(tier =>
            skills.filter(s => s.tier === tier)
          );

          return (
            <View key={category.id} style={styles.categorySection}>
              <LinearGradient
                colors={[category.color[0], category.color[1]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.categoryHeader}
              >
                <Text style={styles.categoryName}>{category.name}</Text>
              </LinearGradient>

              {tierGroups.map((tierSkills, tierIndex) => {
                if (tierSkills.length === 0) return null;

                return (
                  <View key={tierIndex} style={styles.tierRow}>
                    <Text style={styles.tierLabel}>Tier {tierIndex + 1}</Text>
                    <View style={styles.skillsRow}>
                      {tierSkills.map((skill) => {
                        const unlocked = isSkillUnlocked(skill.id);
                        const canUnlock = canUnlockSkill(
                          skill,
                          currentUser?.level || 1,
                          currentUser?.xp || 0,
                          unlockedSkills
                        );

                        return (
                          <TouchableOpacity
                            key={skill.id}
                            style={[
                              styles.skillCard,
                              unlocked && styles.unlockedCard,
                              !unlocked && !canUnlock && styles.lockedCard,
                            ]}
                            onPress={() => !unlocked && handleUnlockSkill(skill)}
                            disabled={unlocked}
                          >
                            <View style={styles.skillIcon}>
                              <Text style={styles.iconText}>{skill.icon}</Text>
                              {unlocked && (
                                <View style={styles.checkBadge}>
                                  <Check size={12} color="#FFFFFF" />
                                </View>
                              )}
                              {!unlocked && !canUnlock && (
                                <View style={styles.lockBadge}>
                                  <Lock size={12} color="#FFFFFF" />
                                </View>
                              )}
                            </View>

                            <Text style={styles.skillName}>{skill.name}</Text>
                            <Text style={styles.skillDescription}>
                              {skill.description}
                            </Text>

                            <View style={styles.skillFooter}>
                              <Text style={styles.costText}>{skill.cost} XP</Text>
                              {!unlocked && (
                                <Text style={styles.levelText}>
                                  Lv. {skill.requiredLevel}
                                </Text>
                              )}
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
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
  header: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  xpBadge: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  xpText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tierRow: {
    marginBottom: 16,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 12,
    marginLeft: 4,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skillCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  unlockedCard: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  lockedCard: {
    opacity: 0.6,
  },
  skillIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  iconText: {
    fontSize: 24,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillName: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  skillDescription: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  skillFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  costText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#8B5CF6',
  },
  levelText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
});
