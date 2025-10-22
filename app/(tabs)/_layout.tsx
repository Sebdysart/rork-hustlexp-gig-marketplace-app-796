import { Tabs } from "expo-router";
import { Home, User, MessageCircle, ClipboardList, Trophy } from "lucide-react-native";
import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { premiumColors, neonGlow } from "@/constants/designTokens";

interface TabIconProps {
  color: string;
  focused: boolean;
  Icon: React.ComponentType<{ color: string; size: number }>;
  badge?: number;
  glowColor?: string;
}

function TabIcon({ color, focused, Icon, badge, glowColor }: TabIconProps) {
  return (
    <View style={styles.iconContainer}>
      {focused && glowColor && Platform.OS !== 'web' && (
        <View style={[styles.iconGlow, { backgroundColor: glowColor, opacity: 0.3 }]} />
      )}
      <View style={[focused && styles.iconFocused]}>
        <Icon color={color} size={focused ? 28 : 24} />
      </View>
      {badge !== undefined && badge > 0 && (
        <LinearGradient
          colors={[premiumColors.neonMagenta, premiumColors.neonViolet]}
          style={styles.badge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.badgeText}>
            {badge > 9 ? '9+' : badge}
          </Text>
        </LinearGradient>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { myAcceptedTasks, myTasks, currentUser, messages, tasks } = useApp();
  const { t } = useLanguage();
  const activeMode = currentUser?.activeMode || 'everyday';
  const isPoster = activeMode === 'business';
  const isTradesman = activeMode === 'tradesmen';

  const activeTasksCount = React.useMemo(() => {
    return myAcceptedTasks.filter(t => t.status === 'in_progress').length;
  }, [myAcceptedTasks]);

  const myPostedTasksCount = React.useMemo(() => {
    return myTasks.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  }, [myTasks]);

  const unreadMessagesCount = React.useMemo(() => {
    if (!currentUser) return 0;

    const hustleAIMessages = messages.filter(m => m.isHustleAI && m.senderId === 'hustleai');
    const hustleAIUnread = hustleAIMessages.filter(m => m.offerStatus === 'pending').length;

    const userTasks = tasks.filter(
      t => t.posterId === currentUser.id || t.workerId === currentUser.id
    );

    const taskUnread = userTasks.reduce((total, task) => {
      const taskMessages = messages.filter(m => m.taskId === task.id && !m.isHustleAI);
      const unread = taskMessages.filter(m => m.senderId !== currentUser.id).length;
      return total + unread;
    }, 0);

    return hustleAIUnread + taskUnread;
  }, [currentUser, messages, tasks]);



  if (isTradesman) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: premiumColors.neonCyan,
          tabBarInactiveTintColor: Colors.textSecondary,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: premiumColors.richBlack,
            borderTopColor: premiumColors.glassWhite,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
            borderBottomColor: premiumColors.glassWhite,
            borderBottomWidth: 1,
          },
          headerTintColor: Colors.text,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('tabs.home'),
            headerTitle: "Tradesmen Pro",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={Home}
                glowColor={premiumColors.neonCyan}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: t('tabs.tasks'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={ClipboardList}
                badge={activeTasksCount}
                glowColor={premiumColors.neonAmber}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="roadmap"
          options={{
            title: t('tabs.roadmap'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={Trophy}
                glowColor={premiumColors.neonMagenta}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={User}
                glowColor={premiumColors.neonViolet}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  if (isPoster) {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: premiumColors.neonCyan,
          tabBarInactiveTintColor: Colors.textSecondary,
          headerShown: true,
          tabBarStyle: {
            backgroundColor: premiumColors.richBlack,
            borderTopColor: premiumColors.glassWhite,
            borderTopWidth: 1,
          },
          headerStyle: {
            backgroundColor: premiumColors.deepBlack,
            borderBottomColor: premiumColors.glassWhite,
            borderBottomWidth: 1,
          },
          headerTintColor: Colors.text,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t('tabs.home'),
            headerTitle: "HustleXP Poster",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={Home}
                glowColor={premiumColors.neonCyan}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: t('tabs.tasks'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={ClipboardList}
                badge={myPostedTasksCount}
                glowColor={premiumColors.neonAmber}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: "Messages",
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={MessageCircle}
                badge={unreadMessagesCount}
                glowColor={premiumColors.neonGreen}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t('tabs.profile'),
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                color={color} 
                focused={focused} 
                Icon={User}
                glowColor={premiumColors.neonMagenta}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="roadmap"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="wallet"
          options={{
            href: null,
          }}
        />
      </Tabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: premiumColors.neonCyan,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: true,
        tabBarStyle: {
          backgroundColor: premiumColors.richBlack,
          borderTopColor: premiumColors.glassWhite,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: premiumColors.deepBlack,
          borderBottomColor: premiumColors.glassWhite,
          borderBottomWidth: 1,
        },
        headerTintColor: Colors.text,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('tabs.home'),
          headerTitle: "HustleXP",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              color={color} 
              focused={focused} 
              Icon={Home}
              glowColor={premiumColors.neonCyan}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: t('tabs.tasks'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              color={color} 
              focused={focused} 
              Icon={ClipboardList}
              badge={activeTasksCount}
              glowColor={premiumColors.neonAmber}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="roadmap"
        options={{
          title: t('tabs.roadmap'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              color={color} 
              focused={focused} 
              Icon={Trophy}
              glowColor={premiumColors.neonMagenta}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, focused }) => (
            <TabIcon 
              color={color} 
              focused={focused} 
              Icon={User}
              glowColor={premiumColors.neonViolet}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 48,
    height: 48,
  },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.3,
  },
  iconFocused: {
    transform: [{ scale: 1.05 }],
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: premiumColors.richBlack,
    ...neonGlow.magenta,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800' as const,
    textAlign: 'center',
  },
});
