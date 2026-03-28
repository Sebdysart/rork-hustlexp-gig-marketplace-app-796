import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import { X, Sparkles, Send } from 'lucide-react-native';
import { useState } from 'react';
import { generateText } from '@rork/toolkit-sdk';
import { LinearGradient } from 'expo-linear-gradient';
import type { User } from '@/types';

interface AIInquiryModalProps {
  visible: boolean;
  hustler: User;
  onClose: () => void;
  onSend: (message: string) => void;
}

export default function AIInquiryModal({ visible, hustler, onClose, onSend }: AIInquiryModalProps) {
  const [userInput, setUserInput] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateAISuggestion = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    try {
      const displayName = hustler.gamertag || hustler.name;
      const topCategory = Object.entries(hustler.genreTasksCompleted || {})
        .sort(([, a], [, b]) => b - a)[0];
      const specialty = topCategory ? topCategory[0] : 'general tasks';

      const prompt = `You are a professional task poster on a gig platform. 
A user wants to reach out to ${displayName}, a hustler specialized in ${specialty}.
The user's rough input is: "${userInput}"

Generate a professional, friendly, and detailed inquiry message that:
1. References the hustler's expertise in ${specialty}
2. Includes key details from the user's input
3. Asks about availability and pricing
4. Is concise but professional (2-3 sentences)
5. Ends with a clear question

Return ONLY the message text, no extra formatting.`;

      const suggestion = await generateText({ messages: [{ role: 'user', content: prompt }] });
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('[AIInquiry] Error generating suggestion:', error);
      setAiSuggestion('Hi! I saw your profile and would love to discuss a potential task. Are you available this week?');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    const messageToSend = aiSuggestion || userInput;
    if (messageToSend.trim()) {
      onSend(messageToSend);
      setUserInput('');
      setAiSuggestion('');
      onClose();
    }
  };

  const handleRegenerate = () => {
    setAiSuggestion('');
    generateAISuggestion();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Reach out to {hustler.gamertag || hustler.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>What work do you need done?</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., I need my 3BR apartment deep cleaned before move-out inspection..."
              value={userInput}
              onChangeText={setUserInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#94A3B8"
            />

            {!aiSuggestion && !isGenerating && userInput.trim().length > 10 && (
              <TouchableOpacity style={styles.generateButton} onPress={generateAISuggestion}>
                <LinearGradient
                  colors={['#7C3AED', '#D946EF']}
                  style={styles.generateGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Sparkles size={20} color="#FFFFFF" />
                  <Text style={styles.generateText}>Generate AI Message</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isGenerating && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#7C3AED" />
                <Text style={styles.loadingText}>Crafting professional message...</Text>
              </View>
            )}

            {aiSuggestion && (
              <View style={styles.suggestionContainer}>
                <View style={styles.suggestionHeader}>
                  <View style={styles.aiLabel}>
                    <Sparkles size={14} color="#7C3AED" />
                    <Text style={styles.aiLabelText}>AI SUGGESTION</Text>
                  </View>
                  <TouchableOpacity onPress={handleRegenerate} style={styles.regenerateButton}>
                    <Text style={styles.regenerateText}>🔄 Regenerate</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.suggestionText}>{aiSuggestion}</Text>
                <View style={styles.suggestionActions}>
                  <TouchableOpacity 
                    style={styles.editButton}
                    onPress={() => {
                      setUserInput(aiSuggestion);
                      setAiSuggestion('');
                    }}
                  >
                    <Text style={styles.editButtonText}>✏️ Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
                    <LinearGradient
                      colors={['#10B981', '#059669']}
                      style={styles.sendGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.sendText}>✅ Send</Text>
                      <Send size={16} color="#FFFFFF" />
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '800' as const,
    color: '#0F172A',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#0F172A',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#0F172A',
    minHeight: 120,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  generateButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  generateGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  generateText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748B',
  },
  suggestionContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#7C3AED',
  },
  suggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  aiLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiLabelText: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: '#7C3AED',
  },
  regenerateButton: {
    padding: 4,
  },
  regenerateText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#7C3AED',
  },
  suggestionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#0F172A',
    marginBottom: 16,
  },
  suggestionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#64748B',
  },
  sendButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sendGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  sendText: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
});
