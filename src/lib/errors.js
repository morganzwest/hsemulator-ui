// Standardized error messages for consistency
export const ERROR_MESSAGES = {
  // Validation errors
  MISSING_REQUIRED_FIELDS: (fields) => `Missing required fields: ${fields.join(', ')}`,
  MISSING_PARAMETERS: (params) => `Missing required parameters: ${params.join(', ')}`,

  // CI/CD specific errors
  FAILED_TO_LOAD_CONFIG: 'Failed to load CI/CD configuration',
  FAILED_TO_SAVE_CONFIG: 'Failed to save CI/CD configuration',
  FAILED_TO_CHECK_STATUS: 'Failed to check workflow status',
  FAILED_TO_FETCH_WORKFLOW: 'Failed to fetch workflow details',
  PROMOTION_FAILED: 'Promotion failed',
  WORKFLOW_ALREADY_UP_TO_DATE: 'Workflow already up to date',
  ACTION_PROMOTED_SUCCESSFULLY: 'Action promoted to HubSpot',

  // Import/Discovery specific errors
  FAILED_TO_DISCOVER_WORKFLOWS: 'Failed to discover workflows',

  // Request errors
  REQUEST_TOO_LARGE: 'Request too large. Maximum size is 1MB.',

  // Environment errors
  MISSING_ENV_VAR: (varName) => `${varName} environment variable is required`,

  // Network/API errors
  NETWORK_ERROR: 'Network error occurred',
  API_ERROR: 'API request failed',
  UNAUTHORIZED: 'Authentication failed',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
}

// Standard error response format
export function createErrorResponse(message, statusCode = 500, details = null) {
  return {
    error: message,
    status: statusCode,
    details,
    timestamp: new Date().toISOString()
  }
}

// Standard success response format
export function createSuccessResponse(data, message = null) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

// Sentry integration utilities
export function captureException(error, context = {}) {
  // Import Sentry dynamically to avoid SSR issues
  import('@sentry/nextjs').then(Sentry => {
    Sentry.captureException(error, {
      contexts: {
        custom: context
      }
    });
  }).catch(err => {
    console.error('Failed to capture exception with Sentry:', err);
  });
}

export function captureMessage(message, level = 'info', context = {}) {
  // Import Sentry dynamically to avoid SSR issues
  import('@sentry/nextjs').then(Sentry => {
    Sentry.captureMessage(message, level, {
      contexts: {
        custom: context
      }
    });
  }).catch(err => {
    console.error('Failed to capture message with Sentry:', err);
  });
}

export function setUserContext(user) {
  // Import Sentry dynamically to avoid SSR issues
  import('@sentry/nextjs').then(Sentry => {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username || user.name
    });
  }).catch(err => {
    console.error('Failed to set user context with Sentry:', err);
  });
}

export function clearUserContext() {
  // Import Sentry dynamically to avoid SSR issues
  import('@sentry/nextjs').then(Sentry => {
    Sentry.setUser(null);
  }).catch(err => {
    console.error('Failed to clear user context with Sentry:', err);
  });
}

// Enhanced error handler that logs to console and Sentry
export function handleError(error, context = {}) {
  // Always log to console for development
  console.error('Application Error:', error, context);

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    captureException(error, context);
  }
}

// Utility to create error boundaries for React components
export function createErrorBoundary(fallback, onError) {
  return {
    fallback,
    onError: (error, errorInfo) => {
      handleError(error, {
        componentStack: errorInfo.componentStack,
        errorBoundary: true
      });

      if (onError) {
        onError(error, errorInfo);
      }
    }
  };
}
