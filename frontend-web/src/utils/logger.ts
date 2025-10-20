import log from 'loglevel';

// Configure loglevel based on environment
const isProduction = process.env.NODE_ENV === 'production';

// Set default log level
if (isProduction) {
  log.setLevel('warn'); // In production, only show warnings and errors
} else {
  log.setLevel('debug'); // In development, show all logs including debug
}

// Create a logger instance with custom methods
const logger = {
  trace: (message: string, ...args: any[]) => log.trace(message, ...args),
  debug: (message: string, ...args: any[]) => log.debug(message, ...args),
  info: (message: string, ...args: any[]) => log.info(message, ...args),
  warn: (message: string, ...args: any[]) => log.warn(message, ...args),
  error: (message: string, ...args: any[]) => log.error(message, ...args),

  // Method to dynamically set log level
  setLevel: (level: log.LogLevelDesc) => log.setLevel(level),

  // Method to get current log level
  getLevel: () => log.getLevel(),

  // Method to enable/disable logging
  enableAll: () => log.enableAll(),
  disableAll: () => log.disableAll(),
};

export default logger;