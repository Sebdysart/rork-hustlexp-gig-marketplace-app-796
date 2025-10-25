import React from 'react';
import { Text } from 'react-native';

let isInstalled = false;

export function installSimpleTextNodeFix() {
  if (isInstalled) {
    console.log('[SimpleTextFix] Already installed');
    return;
  }

  const originalConsoleError = console.error;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    if (message.includes('Unexpected text node') || message.includes('text node cannot be a child')) {
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🔴 TEXT NODE ERROR DETECTED');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Error:', message);
      console.log('');
      console.log('📍 This means text is directly inside a <View> without a <Text> wrapper');
      console.log('');
      console.log('Common causes:');
      console.log('  1. <View>{someString}</View>');
      console.log('  2. <View>{condition && "text"}</View>');
      console.log('  3. <View> </View> (space between tags)');
      console.log('  4. <View>\\n</View> (newline between tags)');
      console.log('');
      console.log('✅ Fix: Wrap all text in <Text> components');
      console.log('  Example: <View><Text>{someString}</Text></View>');
      console.log('');
      console.log('🔍 Look at the stack trace below to find the exact component');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    }
    
    originalConsoleError.apply(console, args);
  };

  isInstalled = true;
  console.log('[SimpleTextFix] ✅ Error interceptor installed');
}

export function wrapTextSafely(content: any): React.ReactElement {
  if (typeof content === 'string' || typeof content === 'number') {
    return React.createElement(Text, null, content);
  }
  return content;
}
