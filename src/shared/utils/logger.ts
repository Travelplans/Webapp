/**
 * Centralized logging service
 * Replaces console.log/error/warn with proper logging
 */

// Get Vite env - use eval to avoid Jest parsing issues
const getViteEnv = (): { DEV?: boolean } | undefined => {
  if (typeof process !== 'undefined' && process.env) {
    return undefined; // Node/Jest environment
  }
  try {
    // Use Function constructor to avoid Jest parsing import.meta
    const getMeta = new Function('return typeof import !== "undefined" ? import.meta : undefined');
    const meta = getMeta();
    return meta?.env;
  } catch {
    return undefined;
  }
};

const viteEnv = getViteEnv();

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
}

class Logger {
  private isDevelopment: boolean;
  private logHistory: LogEntry[] = [];
  private maxHistorySize = 100;

  constructor() {
    // Check if we're in development mode
    // In Vite: import.meta.env.DEV
    // In Jest/Node: process.env.NODE_ENV
    if (typeof process !== 'undefined' && process.env) {
      this.isDevelopment = process.env.NODE_ENV !== 'production';
    } else if (viteEnv) {
      this.isDevelopment = viteEnv.DEV !== false;
    } else {
      // Default to development if we can't determine
      this.isDevelopment = true;
    }
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): LogEntry {
    return {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  private addToHistory(entry: LogEntry): void {
    this.logHistory.push(entry);
    if (this.logHistory.length > this.maxHistorySize) {
      this.logHistory.shift();
    }
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const entry = this.formatMessage(level, message, data);
    this.addToHistory(entry);

    // In production, only log errors and warnings
    if (!this.isDevelopment && level === 'debug') {
      return;
    }

    // Format log message
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`;
    const logMessage = data ? `${prefix} ${message}` : `${prefix} ${message}`;

    // Use appropriate console method
    switch (level) {
      case 'error':
        // eslint-disable-next-line no-console
        console.error(logMessage, data || '');
        // In production, send to error tracking service
        if (!this.isDevelopment) {
          this.sendToErrorTracking(entry);
        }
        break;
      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(logMessage, data || '');
        break;
      case 'info':
        // eslint-disable-next-line no-console
        console.info(logMessage, data || '');
        break;
      case 'debug':
        // eslint-disable-next-line no-console
        console.debug(logMessage, data || '');
        break;
    }
  }

  private sendToErrorTracking(entry: LogEntry): void {
    // TODO: Integrate with error tracking service (Sentry, LogRocket, etc.)
    // Example:
    // if (window.Sentry) {
    //   window.Sentry.captureException(new Error(entry.message), {
    //     extra: entry.data,
    //   });
    // }
  }

  debug(message: string, data?: unknown): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown): void {
    const errorData = error instanceof Error 
      ? { message: error.message, stack: error.stack, name: error.name }
      : error;
    this.log('error', message, errorData);
  }

  getHistory(): LogEntry[] {
    return [...this.logHistory];
  }

  clearHistory(): void {
    this.logHistory = [];
  }
}

export const logger = new Logger();
export default logger;

