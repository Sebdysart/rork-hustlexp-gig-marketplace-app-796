import React, { Component, ReactNode, ErrorInfo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { premiumColors } from '@/constants/designTokens';
import { TextNodeErrorDetector } from '@/utils/textNodeErrorDetector';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  isTextNodeError: boolean;
}

export class TextNodeErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isTextNodeError: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isTextNodeError = error.message.includes('text node') || 
                           error.message.includes('child of a <View>');
    
    return {
      hasError: true,
      isTextNodeError,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const isTextNodeError = error.message.includes('text node') || 
                           error.message.includes('child of a <View>');

    this.setState({
      error,
      errorInfo,
      isTextNodeError,
    });

    if (isTextNodeError) {
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('🚨 TEXT NODE ERROR CAUGHT BY BOUNDARY');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('Error:', error.message);
      console.error('Full Error:', JSON.stringify(error, null, 2));
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Full Error Stack:', error.stack);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('\nDetected Errors from Runtime Scan:');
      console.error(TextNodeErrorDetector.getErrorReport());
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('\n🔍 DEBUGGING TIPS:');
      console.error('1. Check the Component Stack above for the exact component');
      console.error('2. Look for any {variable} without <Text> wrapper');
      console.error('3. Check for {condition && "text"} patterns');
      console.error('4. Ensure all t() calls are inside <Text> or use title prop correctly');
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.error('Error caught by boundary:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = () => {
    TextNodeErrorDetector.clearErrors();
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      isTextNodeError: false,
    });
  };

  render() {
    if (this.state.hasError && this.state.isTextNodeError) {
      const { error, errorInfo } = this.state;
      const detectorReport = TextNodeErrorDetector.getErrorReport();
      
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.emoji}>🚨</Text>
            <Text style={styles.title}>Text Node Error Detected</Text>
          </View>

          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Error Message:</Text>
              <Text style={styles.errorText}>{error?.message}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>What This Means:</Text>
              <Text style={styles.infoText}>
                React Native found text content directly inside a {'<View>'} component.
                {'\n\n'}
                All text in React Native MUST be wrapped in a {'<Text>'} component.
              </Text>
            </View>

            {detectorReport !== 'No text node errors detected' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Detected Issues:</Text>
                <Text style={styles.codeText}>{detectorReport}</Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Component Stack:</Text>
              <Text style={styles.codeText}>{errorInfo?.componentStack}</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How to Fix:</Text>
              <Text style={styles.infoText}>
                1. Find the component mentioned in the stack trace above
                {'\n'}
                2. Look for patterns like: {'{someVariable}'} or {'{condition && "text"}'}
                {'\n'}
                3. Wrap them in {'<Text>'} components
                {'\n\n'}
                Example fix:
                {'\n'}
                {'❌ <View>{userName}</View>'}
                {'\n'}
                {'✅ <View><Text>{userName}</Text></View>'}
              </Text>
            </View>

            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.emoji}>⚠️</Text>
            <Text style={styles.title}>Something went wrong</Text>
          </View>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.errorText}>{this.state.error?.message}</Text>
            </View>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: premiumColors.glassWhite,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: premiumColors.neonMagenta,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: premiumColors.glassWhite,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.neonCyan,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: premiumColors.neonMagenta,
    fontFamily: 'monospace' as const,
  },
  infoText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  codeText: {
    fontSize: 12,
    color: premiumColors.neonAmber,
    fontFamily: 'monospace' as const,
    lineHeight: 18,
  },
  button: {
    backgroundColor: premiumColors.neonCyan,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: premiumColors.deepBlack,
  },
});
