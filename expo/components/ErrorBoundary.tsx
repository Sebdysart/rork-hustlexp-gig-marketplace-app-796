import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react-native';
import { router } from 'expo-router';
import { premiumColors, spacing, borderRadius } from '@/constants/designTokens';
import Colors from '@/constants/colors';
import GlassCard from './GlassCard';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    this.logError(error, errorInfo);
  }

  logError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
      };

      console.log('[ErrorBoundary] Error report:', JSON.stringify(errorReport, null, 2));
    } catch (e) {
      console.error('[ErrorBoundary] Failed to log error:', e);
    }
  };

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(
          this.state.error!,
          this.state.errorInfo!,
          this.resetError
        );
      }

      return (
        <View style={styles.container}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <GlassCard variant="darkStrong" style={styles.card}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={64} color={premiumColors.neonAmber} strokeWidth={2} />
              </View>

              <Text style={styles.title}>Oops! Something went wrong</Text>
              <Text style={styles.subtitle}>
                Don&apos;t worry, this happens sometimes. Try reloading or go back to home.
              </Text>

              <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText} numberOfLines={3}>
                  {this.state.error?.message}
                </Text>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={this.resetError}
                  activeOpacity={0.8}
                >
                  <RefreshCw size={20} color={Colors.text} />
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.secondaryButton]}
                  onPress={() => {
                    this.resetError();
                    router.replace('/');
                  }}
                  activeOpacity={0.8}
                >
                  <Home size={20} color={premiumColors.neonCyan} />
                  <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                    Go Home
                  </Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </ScrollView>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: premiumColors.deepBlack,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: premiumColors.neonAmber + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: premiumColors.neonAmber + '40',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: premiumColors.richBlack,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: spacing.sm,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace' as const,
    lineHeight: 18,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
  },
  primaryButton: {
    backgroundColor: premiumColors.neonAmber + '20',
    borderColor: premiumColors.neonAmber,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderColor: premiumColors.neonCyan + '60',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  secondaryButtonText: {
    color: premiumColors.neonCyan,
  },
});

export default ErrorBoundary;
