interface TextNodeError {
  message: string;
  componentStack: string;
  timestamp: number;
  fileName?: string;
  lineNumber?: number;
}

let errorLog: TextNodeError[] = [];

export function installTextErrorInterceptor() {
  if (!__DEV__) return;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = function(...args: any[]) {
    const message = args.join(' ');
    
    if (
      message.includes('Unexpected text node') ||
      message.includes('text node cannot be a child') ||
      message.includes('Text strings must be rendered')
    ) {
      const error = new Error('Text Node Error Caught');
      const stack = error.stack || '';
      
      const componentStack = extractComponentStack(stack);
      const location = extractFileLocation(stack);
      
      const errorInfo: TextNodeError = {
        message,
        componentStack,
        timestamp: Date.now(),
        fileName: location.fileName,
        lineNumber: location.lineNumber,
      };
      
      errorLog.push(errorInfo);
      
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('🚨 TEXT NODE ERROR DETECTED 🚨');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
      console.log('Error:', message);
      console.log('');
      console.log('📍 Location:');
      if (location.fileName) {
        console.log(`   File: ${location.fileName}`);
        console.log(`   Line: ${location.lineNumber || 'Unknown'}`);
      }
      console.log('');
      console.log('📚 Component Stack:');
      console.log(componentStack);
      console.log('');
      console.log('💡 Common Fixes:');
      console.log('   1. Wrap text in <Text> component');
      console.log('   2. Check conditional renders that return strings');
      console.log('   3. Look for {variable} that might be a string');
      console.log('   4. Check array.map() return values');
      console.log('   5. Remove extra spaces/newlines in JSX');
      console.log('');
      console.log('═══════════════════════════════════════════════════');
      console.log('');
    }
    
    originalError.apply(console, args);
  };

  console.warn = function(...args: any[]) {
    const message = args.join(' ');
    
    if (
      message.includes('Unexpected text node') ||
      message.includes('text node cannot be a child')
    ) {
      const error = new Error('Text Node Warning Caught');
      const stack = error.stack || '';
      
      const componentStack = extractComponentStack(stack);
      const location = extractFileLocation(stack);
      
      const errorInfo: TextNodeError = {
        message,
        componentStack,
        timestamp: Date.now(),
        fileName: location.fileName,
        lineNumber: location.lineNumber,
      };
      
      errorLog.push(errorInfo);
      
      console.log('');
      console.log('⚠️  TEXT NODE WARNING DETECTED ⚠️');
      console.log('File:', location.fileName || 'Unknown');
      console.log('Component Stack:', componentStack);
      console.log('');
    }
    
    originalWarn.apply(console, args);
  };

  console.log('✅ Text Error Interceptor installed');
}

function extractComponentStack(stack: string): string {
  const lines = stack.split('\n');
  const componentLines: string[] = [];
  
  for (const line of lines) {
    if (
      line.includes('/app/') ||
      line.includes('/components/') ||
      line.includes('/contexts/') ||
      line.includes('/screens/')
    ) {
      const match = line.match(/at\s+(\w+)\s+\(/);
      if (match) {
        componentLines.push(match[1]);
      } else {
        const pathMatch = line.match(/\/(app|components|contexts)\/([^:)]+)/);
        if (pathMatch) {
          componentLines.push(pathMatch[2]);
        }
      }
    }
  }
  
  return componentLines.length > 0 
    ? componentLines.join(' → ') 
    : 'Unable to determine component stack';
}

function extractFileLocation(stack: string): { fileName?: string; lineNumber?: number } {
  const lines = stack.split('\n');
  
  for (const line of lines) {
    if (
      line.includes('/app/') ||
      line.includes('/components/') ||
      line.includes('/contexts/')
    ) {
      const webMatch = line.match(/\/(app|components|contexts)\/([^:)]+):(\d+):(\d+)/);
      if (webMatch) {
        return {
          fileName: `${webMatch[1]}/${webMatch[2]}`,
          lineNumber: parseInt(webMatch[3], 10),
        };
      }
      
      const nativeMatch = line.match(/\/(app|components|contexts)\/([^:)]+)/);
      if (nativeMatch) {
        return {
          fileName: `${nativeMatch[1]}/${nativeMatch[2]}`,
        };
      }
    }
  }
  
  return {};
}

export function getTextErrorLog(): TextNodeError[] {
  return [...errorLog];
}

export function clearTextErrorLog(): void {
  errorLog = [];
}

export function getLatestTextError(): TextNodeError | null {
  return errorLog.length > 0 ? errorLog[errorLog.length - 1] : null;
}
