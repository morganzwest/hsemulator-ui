// Standardized error messages for consistency
export const ERROR_MESSAGES = {
  // Validation errors
  MISSING_REQUIRED_FIELDS: (fields) => `Missing required fields: ${fields.join(', ')}`,
  MISSING_PARAMETERS: (params) => `Missing required parameters: ${params.join(', ')}`,
  
  // CI/CD specific errors
  FAILED_TO_LOAD_CONFIG: 'Failed to load CI/CD configuration',
  FAILED_TO_SAVE_CONFIG: 'Failed to save CI/CD configuration',
  FAILED_TO_CHECK_STATUS: 'Failed to check workflow status',
  PROMOTION_FAILED: 'Promotion failed',
  WORKFLOW_ALREADY_UP_TO_DATE: 'Workflow already up to date',
  ACTION_PROMOTED_SUCCESSFULLY: 'Action promoted to HubSpot',
  
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
