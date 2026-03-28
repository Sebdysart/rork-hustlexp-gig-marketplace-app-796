import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { authService } from '@/services/backend/auth';
import { aiService } from '@/services/backend/ai';
import { taskService } from '@/services/backend/tasks';

export default function TestBackendReal() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const addResult = (result: string) => {
    setResults(prev => [...prev, result]);
  };

  const addError = (err: string) => {
    setError(err);
    addResult(`❌ ERROR: ${err}`);
  };

  const clearResults = () => {
    setResults([]);
    setError(null);
  };

  const testLogin = async () => {
    try {
      addResult('🔐 Testing login...');
      const result = await authService.login({
        email: 'sebastian@example.com',
        password: 'password123'
      });
      addResult(`✅ Login successful! User: ${result.user?.name || 'Unknown'}`);
      addResult(`📝 Session ID: ${result.sessionId}`);
      return result.user;
    } catch (err: any) {
      addError(`Login failed: ${err.message}`);
      throw err;
    }
  };

  const testGetCurrentUser = async () => {
    try {
      addResult('👤 Testing getCurrentUser...');
      const user = await authService.getCurrentUser();
      addResult(`✅ Current user: ${user?.name || 'Unknown'}`);
      addResult(`📊 Level: ${user?.level || 'N/A'}, Role: ${user?.role || 'N/A'}`);
      return user;
    } catch (err: any) {
      addError(`getCurrentUser failed: ${err.message}`);
      throw err;
    }
  };

  const testAIChat = async (userId: string) => {
    try {
      addResult('🤖 Testing AI chat...');
      const response = await aiService.chat({
        userId,
        message: 'Find me work nearby',
        context: {
          screen: 'test',
          language: 'en'
        }
      });
      addResult(`✅ AI Response: ${response.response.substring(0, 100)}...`);
      addResult(`📊 Confidence: ${response.confidence}, Suggestions: ${response.suggestions?.length || 0}`);
    } catch (err: any) {
      addError(`AI chat failed: ${err.message}`);
    }
  };

  const testGetTasks = async () => {
    try {
      addResult('📋 Testing get tasks...');
      const response = await taskService.getTasks({ status: 'open' });
      addResult(`✅ Found ${response.tasks?.length || 0} open tasks`);
      if (response.tasks?.[0]) {
        addResult(`📝 First task: ${response.tasks[0].title}`);
      }
    } catch (err: any) {
      addError(`Get tasks failed: ${err.message}`);
    }
  };

  const testParseTask = async (userId: string) => {
    try {
      addResult('🎯 Testing task parsing...');
      const response = await aiService.parseTask({
        userId,
        input: 'Need someone to walk my dog at 3pm today, will pay $30',
        context: {
          currentTime: new Date().toISOString(),
          language: 'en'
        }
      });
      addResult(`✅ Parsed task: ${response.task.title}`);
      addResult(`💰 Pay: $${response.task.pay.amount} (${response.confidence} confidence)`);
    } catch (err: any) {
      addError(`Task parsing failed: ${err.message}`);
    }
  };

  const runFullTest = async () => {
    clearResults();
    setLoading(true);
    setError(null);

    try {
      addResult('🚀 Starting full backend integration test...');
      addResult('---');

      // Test 1: Login
      const user = await testLogin();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 2: Get current user
      const currentUser = await testGetCurrentUser();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 3: AI Chat
      await testAIChat(user?.id || currentUser?.id || 'test-user');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 4: Get Tasks
      await testGetTasks();
      await new Promise(resolve => setTimeout(resolve, 500));

      // Test 5: Parse Task
      await testParseTask(user?.id || currentUser?.id || 'test-user');
      
      addResult('---');
      addResult('🎉 ALL TESTS COMPLETE!');
      
      if (!error) {
        addResult('✅ Backend connection is working perfectly!');
      }
    } catch (err: any) {
      addResult('---');
      addResult('❌ Tests stopped due to error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Backend Connection Test' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>🔌 Backend Integration Test</Text>
        <Text style={styles.subtitle}>Testing connection to:</Text>
        <Text style={styles.url}>https://LunchGarden.dycejr.replit.dev</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={runFullTest}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>🚀 Run Full Test Suite</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.clearButton}
        onPress={clearResults}
      >
        <Text style={styles.clearButtonText}>🗑️ Clear Results</Text>
      </TouchableOpacity>

      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ Error detected - check logs below</Text>
        </View>
      )}

      <ScrollView style={styles.results}>
        {results.map((result, index) => (
          <View key={index} style={styles.resultRow}>
            <Text style={[
              styles.resultText,
              result.includes('❌') && styles.errorResultText,
              result.includes('✅') && styles.successResultText,
              result.includes('---') && styles.separatorText
            ]}>
              {result}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 4,
  },
  url: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: '#3B82F6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  clearButtonText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  errorBanner: {
    backgroundColor: '#DC2626',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  results: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
  },
  resultRow: {
    marginBottom: 8,
  },
  resultText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontFamily: 'monospace',
  },
  errorResultText: {
    color: '#FCA5A5',
  },
  successResultText: {
    color: '#86EFAC',
  },
  separatorText: {
    color: '#475569',
  },
});
