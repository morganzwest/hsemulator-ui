// This file configures the initialization of Sentry on the server side
// The config you add here will be used whenever the Next.js server is running
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Configure environment
  environment: process.env.NODE_ENV || 'development',

  // beforeSend filter to remove sensitive information
  beforeSend(event) {
    // Remove sensitive data from request data
    if (event.request && event.request.data) {
      // Filter out potential sensitive fields
      const sensitiveFields = ['token', 'key', 'secret', 'password', 'authorization'];
      const filteredData = { ...event.request.data };
      
      sensitiveFields.forEach(field => {
        if (filteredData[field]) {
          filteredData[field] = '[FILTERED]';
        }
      });
      
      event.request.data = filteredData;
    }

    // Filter out certain error messages that might contain sensitive data
    if (event.exception && event.exception.values) {
      event.exception.values = event.exception.values.filter(exception => {
        const message = exception.value || '';
        return !message.includes('token') && 
               !message.includes('key') && 
               !message.includes('secret') &&
               !message.includes('password');
      });
    }

    return event;
  },
});
