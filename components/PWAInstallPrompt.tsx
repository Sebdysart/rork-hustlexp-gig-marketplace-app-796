import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hustlexp_pwa_prompt_dismissed';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const checkPromptStatus = async () => {
      const dismissed = await AsyncStorage.getItem(STORAGE_KEY);
      if (dismissed) return;

      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) return;

      const handler = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowPrompt(true);
      };

      window.addEventListener('beforeinstallprompt', handler);

      return () => {
        window.removeEventListener('beforeinstallprompt', handler);
      };
    };

    checkPromptStatus();
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    console.log(`PWA install outcome: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = async () => {
    await AsyncStorage.setItem(STORAGE_KEY, 'true');
    setShowPrompt(false);
  };

  if (!showPrompt || Platform.OS !== 'web') {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Download size={24} color={Colors.accent} />
        <View style={styles.textContainer}>
          <Text style={styles.title}>Install HustleXP</Text>
          <Text style={styles.description}>
            Add to your home screen for the full quest experience!
          </Text>
        </View>
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
            <X size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.installButton} onPress={handleInstall}>
            <Text style={styles.installButtonText}>Install</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  content: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dismissButton: {
    padding: 8,
  },
  installButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  installButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
