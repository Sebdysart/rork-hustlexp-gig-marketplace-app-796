interface ErrorReport {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userId?: string;
  userAgent?: string;
  appVersion?: string;
  route?: string;
}

class ErrorTracker {
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  logError(error: Error, context?: {
    userId?: string;
    route?: string;
    componentStack?: string;
  }) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: context?.componentStack,
      timestamp: new Date().toISOString(),
      userId: context?.userId,
      route: context?.route,
      appVersion: '1.0.0',
    };

    console.error('[ErrorTracker] Logging error:', errorReport);

    this.errorQueue.push(errorReport);

    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    return errorReport;
  }

  logWarning(message: string, context?: Record<string, any>) {
    console.warn('[ErrorTracker] Warning:', message, context);
  }

  getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errorQueue.slice(-limit);
  }

  clearErrors() {
    this.errorQueue = [];
  }

  async sendErrorReport(errorReport: ErrorReport): Promise<boolean> {
    try {
      console.log('[ErrorTracker] Would send error report:', errorReport);
      return true;
    } catch (e) {
      console.error('[ErrorTracker] Failed to send error report:', e);
      return false;
    }
  }

  getAllErrors(): ErrorReport[] {
    return [...this.errorQueue];
  }
}

export const errorTracker = new ErrorTracker();

export function setupGlobalErrorHandler() {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    try {
      if (args[0] instanceof Error) {
        errorTracker.logError(args[0]);
      } else if (typeof args[0] === 'string') {
        errorTracker.logWarning(args[0], { additionalArgs: args.slice(1) });
      }
    } catch (e) {
      originalConsoleError('[ErrorTracker] Failed to track error:', e);
    }
    originalConsoleError(...args);
  };

  console.log('[ErrorTracker] Global error handler installed');
}
