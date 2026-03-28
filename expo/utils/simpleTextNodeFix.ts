import React from 'react';
import { Text } from 'react-native';

let isInstalled = false;
let errorCount = 0;

export function installSimpleTextNodeFix() {
  if (isInstalled) {
    console.log('[SimpleTextFix] Already installed');
    return;
  }

  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;

  console.error = (...args: any[]) => {
    const message = args.join(' ');
    
    if (message.includes('Unexpected text node') || message.includes('text node cannot be a child')) {
      errorCount++;
      console.log('');
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`🔴 TEXT NODE ERROR DETECTED (#${errorCount})`);
      console.log('═══════════════════════════════════════════════════════════');
      console.log('Full Error:', message);
      console.log('');
      
      // Try to extract the actual text that caused the error
      const textMatch = message.match(/Unexpected text node:\s*(.+?)\s*\./i);
      if (textMatch && textMatch[1]) {
        console.log('❌ Problematic Text:', JSON.stringify(textMatch[1]));
        console.log('   Character Code:', textMatch[1].charCodeAt(0));
        console.log('   Length:', textMatch[1].length);
        console.log('');
      }
      
      console.log('📍 This means text is directly inside a <View> without a <Text> wrapper');
      console.log('');
      console.log('Common causes:');
      console.log('  1. <View>{someString}</View>');
      console.log('  2. <View>{condition && "text"}</View>');
      console.log('  3. <View>{translations[i]}</View> - translation returns "."');
      console.log('  4. <View> </View> (space between tags)');
      console.log('  5. <View>\\n</View> (newline between tags)');
      console.log('');
      console.log('✅ Fix: Wrap all text in <Text> components');
      console.log('  Example: <View><Text>{someString || " "}</Text></View>');
      console.log('');
      console.log('🔍 Look at the stack trace below to find the exact component');
      console.log('═══════════════════════════════════════════════════════════');
      console.log('');
    }
    
    originalConsoleError.apply(console, args);
  };

  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    if (message.includes('Unexpected text node') || message.includes('text node cannot be a child')) {
      console.error(...args);
      return;
    }
    
    originalConsoleWarn.apply(console, args);
  };

  isInstalled = true;
  console.log('[SimpleTextFix] ✅ Error interceptor installed');
  console.log('[SimpleTextFix] Monitoring for text node errors...');
}

export function wrapTextSafely(content: any): React.ReactElement {
  if (typeof content === 'string' || typeof content === 'number') {
    return React.createElement(Text, null, content);
  }
  return content;
}
