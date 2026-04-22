/**
 * Logger utility that conditionally logs based on environment
 * In production, all logging is disabled by default
 */

const isDevelopment = import.meta.env.MODE === 'development';
const isLoggingEnabled = import.meta.env.VITE_ENABLE_LOGGING === 'true';

// Enable logging if in development OR if explicitly enabled via env var
const shouldLog = isDevelopment || isLoggingEnabled;

export const logger = {
  log: (...args: any[]) => {
    if (shouldLog) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    if (shouldLog) {
      console.error(...args);
    }
  },
  warn: (...args: any[]) => {
    if (shouldLog) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (shouldLog) {
      console.info(...args);
    }
  },
};

// Default export for convenience
export default logger;
