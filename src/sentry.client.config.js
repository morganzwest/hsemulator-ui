// This file configures the initialization of Sentry on the client side
// The config you add here will be used whenever a users loads a page in their browser
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Configure environment
  environment: process.env.NODE_ENV || 'development',

  // beforeSend filter to remove sensitive information
  beforeSend(event) {
    // Remove sensitive data from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.filter(breadcrumb => {
        // Filter out potential sensitive URLs
        if (breadcrumb.data && breadcrumb.data.url) {
          return !breadcrumb.data.url.includes('token') &&
            !breadcrumb.data.url.includes('key') &&
            !breadcrumb.data.url.includes('secret');
        }
        return true;
      });
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
