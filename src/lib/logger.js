// Simple logger utility that only logs in development
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  debug: (message, ...args) => {
    if (isDevelopment) {
      console.debug(message, ...args)
    }
  },
  
  log: (message, ...args) => {
    if (isDevelopment) {
      console.log(message, ...args)
    }
  },
  
  error: (message, ...args) => {
    // Always log errors, but with different formatting in production
    if (isDevelopment) {
      console.error(message, ...args)
    } else {
      console.error('[ERROR]', message, ...args)
    }
  },
  
  warn: (message, ...args) => {
    if (isDevelopment) {
      console.warn(message, ...args)
    } else {
      console.warn('[WARN]', message, ...args)
    }
  }
}
