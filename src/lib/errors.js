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
/**
 * Creates a standardized error response object with consistent format
 * 
 * @param {string} message - The error message to include in the response
 * @param {number} [statusCode=500] - HTTP status code for the error
 * @param {any} [details=null] - Additional error details or context
 * 
 * @returns {Object} Standardized error response object
 * @returns {string} returns.error - The error message
 * @returns {number} returns.status - The HTTP status code
 * @returns {any} returns.details - Additional error details
 * @returns {string} returns.timestamp - ISO timestamp of when the error occurred
 * 
 * @example
 * const errorResponse = createErrorResponse(
 *   'Validation failed',
 *   400,
 *   { field: 'email', reason: 'invalid format' }
 * );
 */
export function createErrorResponse(message, statusCode = 500, details = null) {
  return {
    error: message,
    status: statusCode,
    details,
    timestamp: new Date().toISOString()
  }
}

// Standard success response format
/**
 * Creates a standardized success response object with consistent format
 * 
 * @param {any} data - The data to include in the success response
 * @param {string|null} [message=null] - Optional success message
 * 
 * @returns {Object} Standardized success response object
 * @returns {boolean} returns.success - Always true for success responses
 * @returns {any} returns.data - The response data
 * @returns {string|null} returns.message - Optional success message
 * @returns {string} returns.timestamp - ISO timestamp of when the response was created
 * 
 * @example
 * const successResponse = createSuccessResponse(
 *   { id: 123, name: 'John Doe' },
 *   'User created successfully'
 * );
 */
export function createSuccessResponse(data, message = null) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }
}

// Sentry integration utilities
/**
 * Captures and reports exceptions to Sentry for error tracking and monitoring
 * 
 * @param {Error} error - The error object to capture
 * @param {Object} [context={}] - Additional context information to include with the error
 * 
 * @returns {void}
 * 
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, {
 *     userId: 'user-123',
 *     action: 'data-import',
 *     timestamp: new Date().toISOString()
 *   });
 * }
 */
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

/**
 * Captures and reports messages to Sentry for logging and monitoring
 * 
 * @param {string} message - The message to capture
 * @param {string} [level='info'] - Sentry severity level ('info', 'warning', 'error', etc.)
 * @param {Object} [context={}] - Additional context information to include with the message
 * 
 * @returns {void}
 * 
 * @example
 * captureMessage('User logged in successfully', 'info', {
 *   userId: 'user-123',
 *   loginMethod: 'oauth'
 * });
 * 
 * captureMessage('Payment processing failed', 'error', {
 *   orderId: 'order-456',
 *   amount: 99.99
 * });
 */
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

/**
 * Sets user context in Sentry for better error tracking and user-specific monitoring
 * 
 * @param {Object} user - User object with identification information
 * @param {string} user.id - Unique user identifier
 * @param {string} user.email - User email address
 * @param {string} [user.username] - Optional username or display name
 * @param {string} [user.name] - Optional display name (fallback for username)
 * 
 * @returns {void}
 * 
 * @example
 * setUserContext({
 *   id: 'user-123',
 *   email: 'john.doe@example.com',
 *   username: 'johndoe'
 * });
 */
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

/**
 * Clears the user context in Sentry, ending user-specific error tracking session
 * 
 * @returns {void}
 * 
 * @example
 * // When user logs out
 * clearUserContext();
 */
export function clearUserContext() {
  // Import Sentry dynamically to avoid SSR issues
  import('@sentry/nextjs').then(Sentry => {
    Sentry.setUser(null);
  }).catch(err => {
    console.error('Failed to clear user context with Sentry:', err);
  });
}

// Enhanced error handler that logs to console and Sentry
/**
 * Enhanced error handler that logs to console in development and sends to Sentry in production
 * 
 * @param {Error} error - The error object to handle
 * @param {Object} [context={}] - Additional context information for debugging
 * 
 * @returns {void}
 * 
 * @example
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   handleError(error, {
 *     component: 'UserProfile',
 *     action: 'update-profile',
 *     userId: 'user-123'
 *   });
 * }
 */
export function handleError(error, context = {}) {
  // Always log to console for development
  console.error('Application Error:', error, context);

  // Send to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    captureException(error, context);
  }
}

// Utility to create error boundaries for React components
/**
 * Creates an error boundary configuration for React components with standardized error handling
 * 
 * @param {React.Component} fallback - The fallback component to render when an error occurs
 * @param {Function} [onError] - Optional callback function to handle errors when they occur
 * 
 * @returns {Object} Error boundary configuration object
 * @returns {React.Component} returns.fallback - The fallback component
 * @returns {Function} returns.onError - The error handler function
 * 
 * @example
 * const errorBoundary = createErrorBoundary(
 *   <ErrorFallback />,
 *   (error, errorInfo) => {
 *     console.error('Component error:', error);
 *     // Additional error handling logic
 *   }
 * );
 * 
 * // Usage in React component:
 * <ErrorBoundary {...errorBoundary}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
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
