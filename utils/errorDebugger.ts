/**
 * Runtime Error Debugger
 * Helps identify "Unexpected text node" errors in React Native
 */

import { Platform } from 'react-native';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
}

export class RuntimeErrorDebugger {
  private static errors: ErrorInfo[] = [];

  /**
   * Install global error handler
   */
  static install() {
    if (Platform.OS === 'web') {
      // Web error handler
      window.addEventListener('error', (event) => {
        this.captureError({
          message: event.message,
          stack: event.error?.stack,
        });
      });

      // React error boundary fallback
      window.addEventListener('unhandledrejection', (event) => {
        this.captureError({
          message: event.reason?.message || 'Unhandled Promise Rejection',
          stack: event.reason?.stack,
        });
      });
    }

    // React Native error handler
    const originalHandler = ErrorUtils.getGlobalHandler();
    ErrorUtils.setGlobalHandler((error, isFatal) => {
      this.captureError({
        message: error.message,
        stack: error.stack,
      });

      // Call original handler
      if (originalHandler) {
        originalHandler(error, isFatal);
      }
    });

    console.log('[RuntimeErrorDebugger] Installed successfully');
  }

  /**
   * Capture error details
   */
  private static captureError(errorInfo: ErrorInfo) {
    this.errors.push({
      ...errorInfo,
      message: errorInfo.message || 'Unknown error',
    });

    // Check if this is the "Unexpected text node" error
    if (errorInfo.message.includes('Unexpected text node')) {
      console.error('🔴 FOUND IT! Unexpected text node error:');
      console.error('Message:', errorInfo.message);
      console.error('Stack:', errorInfo.stack);
      
      // Try to extract component name from stack
      const componentMatch = errorInfo.stack?.match(/at (\w+)/);
      if (componentMatch) {
        console.error('🎯 Likely component:', componentMatch[1]);
      }

      // Extract file location
      const fileMatch = errorInfo.stack?.match(/\((.*?):\d+:\d+\)/);
      if (fileMatch) {
        console.error('📁 File location:', fileMatch[1]);
      }

      // Alert on web for immediate visibility
      if (Platform.OS === 'web') {
        const componentName = componentMatch?.[1] || 'Unknown';
        alert(`FOUND TEXT NODE ERROR!\n\nComponent: ${componentName}\n\nCheck console for details.`);
      }
    }

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  }

  /**
   * Get all captured errors
   */
  static getErrors(): ErrorInfo[] {
    return [...this.errors];
  }

  /**
   * Get text node errors only
   */
  static getTextNodeErrors(): ErrorInfo[] {
    return this.errors.filter(e => 
      e.message.includes('Unexpected text node') ||
      e.message.includes('text node cannot be a child')
    );
  }

  /**
   * Clear error log
   */
  static clear() {
    this.errors = [];
  }

  /**
   * Print summary
   */
  static printSummary() {
    console.log('=== Error Summary ===');
    console.log('Total errors:', this.errors.length);
    console.log('Text node errors:', this.getTextNodeErrors().length);
    
    const textNodeErrors = this.getTextNodeErrors();
    if (textNodeErrors.length > 0) {
      console.log('\n🔴 Text Node Errors:');
      textNodeErrors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.message}`);
        if (error.stack) {
          const lines = error.stack.split('\n').slice(0, 5);
          console.log(lines.join('\n'));
        }
      });
    }
  }
}

// Auto-install in development
if (__DEV__) {
  RuntimeErrorDebugger.install();
}

export default RuntimeErrorDebugger;
