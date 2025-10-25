import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider, useApp } from "@/contexts/AppContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { SquadContext } from "@/contexts/SquadContext";
import { TaskLifecycleProvider } from "@/contexts/TaskLifecycleContext";
import { OfferContext } from "@/contexts/OfferContext";
import { AIProfileProvider } from "@/contexts/AIProfileContext";
import { AnalyticsProvider } from "@/contexts/AnalyticsContext";
import NotificationCenter from "@/components/NotificationCenter";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import TranslationLoadingOverlay from "@/components/TranslationLoadingOverlay";
import { TextNodeErrorBoundary } from "@/components/TextNodeErrorBoundary";
import { premiumColors } from "@/constants/designTokens";
import Colors from "@/constants/colors";
import '@/utils/errorDebugger';
import { installSimpleTextNodeFix } from '@/utils/simpleTextNodeFix';
import { installTextNodeProtection } from '@/utils/textNodeProtection';
import { installFinalTextNodeFix } from '@/utils/finalTextNodeFix';
import { ErrorUtils } from 'react-native';

// Install all layers of text node protection
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🛑 Installing Text Node Protection');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

if (__DEV__) {
  installSimpleTextNodeFix();
}
installTextNodeProtection();
installFinalTextNodeFix();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Text Node Protection ACTIVE');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Global error handler for text node errors
const originalErrorHandler = ErrorUtils.getGlobalHandler();
ErrorUtils.setGlobalHandler((error, isFatal) => {
  if (error.message && (error.message.includes('text node') || error.message.includes('child of a <View>'))) {
    console.error('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('🚨 GLOBAL TEXT NODE ERROR CAUGHT');
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.error('Message:', error.message);
    console.error('Stack:', error.stack);
    console.error('Is Fatal:', isFatal);
    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n');
    
    // Don't propagate text node errors in production - just log them
    if (!__DEV__ && !isFatal) {
      return;
    }
  }
  
  originalErrorHandler(error, isFatal);
});

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
        <Stack.Screen name="admin" options={{ title: 'Admin Dashboard' }} />
        <Stack.Screen name="test-suite" options={{ presentation: 'modal', title: 'Test Suite' }} />
        <Stack.Screen name="test-dashboard" options={{ presentation: 'modal', title: 'Test Dashboard' }} />
        <Stack.Screen name="tradesmen-dashboard" options={{ title: 'Tradesmen Pro' }} />
        <Stack.Screen name="certification-upload" options={{ title: 'Upload Certification' }} />
        <Stack.Screen name="portfolio" options={{ title: 'Portfolio' }} />
        <Stack.Screen name="pro-quests" options={{ title: 'Pro Quests' }} />
        <Stack.Screen name="pro-task-board" options={{ title: 'Pro Task Board' }} />
        <Stack.Screen name="create-squad" options={{ presentation: 'modal', title: 'Create Squad' }} />
        <Stack.Screen name="squad/[id]" options={{ title: 'Squad Details' }} />
        <Stack.Screen name="task-accept/[id]" options={{ presentation: 'modal', title: 'Accept Task' }} />
        <Stack.Screen name="task-active/[id]" options={{ title: 'Active Task' }} />
        <Stack.Screen name="task-verify/[id]" options={{ title: 'Verify Completion' }} />
        <Stack.Screen name="task-complete/[id]" options={{ presentation: 'modal', title: 'Task Complete!' }} />
        <Stack.Screen name="offers/index" options={{ title: 'My Offers' }} />
        <Stack.Screen name="offers/new" options={{ presentation: 'modal', title: 'Create Offer' }} />
        <Stack.Screen name="analytics-dashboard" options={{ title: 'Analytics' }} />
        <Stack.Screen name="error-finder" options={{ title: 'Error Finder' }} />
        <Stack.Screen name="text-node-scanner" options={{ title: 'Text Node Scanner' }} />
        <Stack.Screen name="text-error-scanner" options={{ title: 'Text Error Scanner' }} />
        <Stack.Screen name="diagnostic-center" options={{ title: 'Diagnostic Center' }} />
      </Stack>
      <NotificationCenter />
      <PWAInstallPrompt />
      <TranslationLoadingOverlay />
    </>
  );
}

function SplashScreenManager() {
  const { isLoading } = useApp();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return null;
}

export default function RootLayout() {
  return (
    <TextNodeErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <LanguageProvider>
            <ThemeProvider>
            <SettingsProvider>
              <NotificationProvider>
                <AnalyticsProvider>
                  <AppProvider>
                    <AIProfileProvider>
                      <TaskLifecycleProvider>
                        <SquadContext>
                          <OfferContext>
                            <SplashScreenManager />
                            <RootLayoutNav />
                          </OfferContext>
                        </SquadContext>
                      </TaskLifecycleProvider>
                    </AIProfileProvider>
                  </AppProvider>
                </AnalyticsProvider>
              </NotificationProvider>
            </SettingsProvider>
            </ThemeProvider>
          </LanguageProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </TextNodeErrorBoundary>
  );
}
