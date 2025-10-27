import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated, Platform } from 'react-native';
import { CheckCircle, XCircle, AlertTriangle, Navigation, MessageCircle, DollarSign, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { COLORS } from '@/constants/designTokens';

export interface AIActionRequest {
  id: string;
  type: 'accept-task' | 'send-message' | 'navigate' | 'create-offer' | 'update-availability' | 'bundle-tasks';
  title: string;
  description: string;
  data: any;
  preview?: React.ReactNode;
  risk?: 'low' | 'medium' | 'high';
  benefits?: string[];
  warnings?: string[];
}

interface AIActionConfirmationProps {
  action: AIActionRequest | null;
  onConfirm: (action: AIActionRequest) => Promise<void>;
  onCancel: () => void;
  onEdit?: (action: AIActionRequest) => void;
}

export function AIActionConfirmation({
  action,
  onConfirm,
  onCancel,
  onEdit,
}: AIActionConfirmationProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{ success: boolean; message: string } | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (action) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } else {
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      setExecutionResult(null);
    }
  }, [action, scaleAnim, fadeAnim]);

  if (!action) {
    return null;
  }

  const handleConfirm = async () => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      await onConfirm(action);
      setExecutionResult({
        success: true,
        message: 'Action completed successfully!',
      });

      setTimeout(() => {
        onCancel();
      }, 1500);
    } catch (error) {
      setExecutionResult({
        success: false,
        message: error instanceof Error ? error.message : 'Action failed',
      });

      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onCancel();
  };

  const handleEdit = () => {
    if (onEdit && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onEdit?.(action);
  };

  const getActionIcon = () => {
    switch (action.type) {
      case 'accept-task':
        return <CheckCircle size={32} color={COLORS.secondary} />;
      case 'send-message':
        return <MessageCircle size={32} color={COLORS.secondary} />;
      case 'navigate':
        return <Navigation size={32} color={COLORS.secondary} />;
      case 'create-offer':
        return <DollarSign size={32} color={COLORS.secondary} />;
      case 'bundle-tasks':
        return <Zap size={32} color={COLORS.secondary} />;
      default:
        return <CheckCircle size={32} color={COLORS.secondary} />;
    }
  };

  const getRiskColor = () => {
    switch (action.risk) {
      case 'low':
        return '#10b981';
      case 'medium':
        return '#f59e0b';
      case 'high':
        return '#ef4444';
      default:
        return COLORS.textSecondary;
    }
  };

  return (
    <Modal
      visible={!!action}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          {executionResult ? (
            <View style={styles.resultContainer}>
              {executionResult.success ? (
                <CheckCircle size={64} color="#10b981" />
              ) : (
                <XCircle size={64} color="#ef4444" />
              )}
              <Text style={[styles.resultText, executionResult.success ? styles.successText : styles.errorText]}>
                {executionResult.message}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.header}>
                <View style={styles.iconContainer}>
                  {getActionIcon()}
                </View>
                <Text style={styles.title}>{action.title}</Text>
                <Text style={styles.description}>{action.description}</Text>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {action.preview && (
                  <View style={styles.previewContainer}>
                    {action.preview}
                  </View>
                )}

                {action.benefits && action.benefits.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>✅ Benefits</Text>
                    {action.benefits.map((benefit, index) => (
                      <Text key={index} style={styles.benefitText}>• {benefit}</Text>
                    ))}
                  </View>
                )}

                {action.warnings && action.warnings.length > 0 && (
                  <View style={styles.section}>
                    <View style={styles.warningHeader}>
                      <AlertTriangle size={20} color="#f59e0b" />
                      <Text style={styles.sectionTitle}>⚠️ Important</Text>
                    </View>
                    {action.warnings.map((warning, index) => (
                      <Text key={index} style={styles.warningText}>• {warning}</Text>
                    ))}
                  </View>
                )}

                {action.risk && (
                  <View style={styles.riskBadge}>
                    <View style={[styles.riskDot, { backgroundColor: getRiskColor() }]} />
                    <Text style={[styles.riskText, { color: getRiskColor() }]}>
                      {action.risk.toUpperCase()} RISK
                    </Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.actions}>
                {onEdit && (
                  <TouchableOpacity
                    style={[styles.button, styles.editButton]}
                    onPress={handleEdit}
                    disabled={isExecuting}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    disabled={isExecuting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton, isExecuting && styles.buttonDisabled]}
                    onPress={handleConfirm}
                    disabled={isExecuting}
                  >
                    <Text style={styles.confirmButtonText}>
                      {isExecuting ? 'Executing...' : 'Confirm'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: 20,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    padding: 24,
    alignItems: 'center' as const,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${COLORS.secondary}15`,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: COLORS.text,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  previewContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: COLORS.text,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    color: '#10b981',
    lineHeight: 22,
    marginBottom: 4,
  },
  warningHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    color: '#f59e0b',
    lineHeight: 22,
    marginBottom: 4,
  },
  riskBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
  },
  riskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  actions: {
    padding: 24,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  buttonRow: {
    flexDirection: 'row' as const,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  editButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.secondary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: COLORS.text,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#fff',
  },
  resultContainer: {
    padding: 48,
    alignItems: 'center' as const,
    gap: 24,
  },
  resultText: {
    fontSize: 18,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
  },
  successText: {
    color: '#10b981',
  },
  errorText: {
    color: '#ef4444',
  },
});
