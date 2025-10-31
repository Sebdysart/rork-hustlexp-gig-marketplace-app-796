import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { TasksProvider, setTasksNotificationHandler } from "@/contexts/TasksContext";
import { EconomyProvider, setEconomyNotificationHandler } from "@/contexts/EconomyContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import NotificationCenter from "@/components/NotificationCenter";
import { premiumColors } from "@/constants/designTokens";
import Colors from "@/constants/colors";



SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <>
      <Stack screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: premiumColors.deepBlack,
        },
        headerTintColor: Colors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: premiumColors.deepBlack,
        },
      }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="ai-onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="post-task" options={{ presentation: 'modal', title: 'Post Quest' }} />
        <Stack.Screen name="adventure-map" options={{ presentation: 'modal', title: 'Adventure Map' }} />
        <Stack.Screen name="shop" options={{ presentation: 'modal', title: 'Power-Up Shop' }} />
        <Stack.Screen name="trust-center" options={{ title: 'Trust Center' }} />
        <Stack.Screen name="verification" options={{ title: 'Verification' }} />
        <Stack.Screen name="settings" options={{ title: 'Settings' }} />
        <Stack.Screen name="notification-settings" options={{ title: 'Notifications' }} />
        <Stack.Screen name="kyc-verification" options={{ title: 'KYC Verification' }} />
        <Stack.Screen name="disputes" options={{ title: 'Dispute Resolution' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', title: 'Search' }} />


        <Stack.Screen name="task-accept/[id]" options={{ presentation: 'modal', title: 'Accept Task' }} />
        <Stack.Screen name="task-active/[id]" options={{ title: 'Active Task' }} />
        <Stack.Screen name="task-verify/[id]" options={{ title: 'Verify Completion' }} />
        <Stack.Screen name="task-complete/[id]" options={{ presentation: 'modal', title: 'Task Complete!' }} />
        <Stack.Screen name="offers/index" options={{ title: 'My Offers' }} />
        <Stack.Screen name="offers/new" options={{ presentation: 'modal', title: 'Create Offer' }} />
        <Stack.Screen name="analytics-dashboard" options={{ title: 'Analytics' }} />

      </Stack>
      <NotificationCenter />
    </>
  );
}

function SplashScreenManager() {
  const { isLoading } = useUser();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}

function NotificationBridge() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    setTasksNotificationHandler(addNotification);
    setEconomyNotificationHandler(addNotification);
  }, [addNotification]);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <SettingsProvider>
            <NotificationProvider>
              <UserProvider>
                <TasksProvider>
                  <EconomyProvider>
                    <NotificationBridge />
                    <SplashScreenManager />
                    <RootLayoutNav />
                  </EconomyProvider>
                </TasksProvider>
              </UserProvider>
            </NotificationProvider>
          </SettingsProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
