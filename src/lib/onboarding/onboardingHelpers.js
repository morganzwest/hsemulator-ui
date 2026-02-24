// LocalStorage keys for onboarding state
const ONBOARDING_STATUS_KEY = 'onboarding_status';
const ONBOARDING_STEP_KEY = 'onboarding_step';
const ONBOARDING_SOURCE_KEY = 'onboarding_source';
const ONBOARDING_PROFILE_BACKUP_KEY = 'onboarding_profile_backup';
const ONBOARDING_DB_FAILED_KEY = 'onboarding_db_failed';

// Onboarding status values
export const ONBOARDING_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// Onboarding steps
export const ONBOARDING_STEPS = {
  PROFILE: 0,
  ACCOUNT: 1,
  PORTAL: 2,
  PREFERENCES: 3,
  COMPLETE: 4
};

/**
 * Get onboarding status from localStorage
 * @returns {string|null} Onboarding status or null if not found
 */
export function getOnboardingStatus() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ONBOARDING_STATUS_KEY);
}

/**
 * Set onboarding status in localStorage
 * @param {string} status - Onboarding status value
 */
export function setOnboardingStatus(status) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STATUS_KEY, status);
}

/**
 * Get current onboarding step from localStorage
 * @returns {number} Current step number (0 if not found)
 */
export function getOnboardingStep() {
  if (typeof window === 'undefined') return 0;
  return parseInt(localStorage.getItem(ONBOARDING_STEP_KEY) || '0');
}

/**
 * Set current onboarding step in localStorage
 * @param {number} step - Step number
 */
export function setOnboardingStep(step) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_STEP_KEY, String(step));
}

/**
 * Get onboarding source from localStorage
 * @returns {string|null} Source of onboarding or null if not found
 */
export function getOnboardingSource() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ONBOARDING_SOURCE_KEY);
}

/**
 * Set onboarding source in localStorage
 * @param {string} source - Source of onboarding ('new', 'invite', 'manual')
 */
export function setOnboardingSource(source) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_SOURCE_KEY, source);
}

/**
 * Clear all onboarding data from localStorage
 */
export function clearOnboardingData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_STATUS_KEY);
  localStorage.removeItem(ONBOARDING_STEP_KEY);
  localStorage.removeItem(ONBOARDING_SOURCE_KEY);
}

/**
 * Check if onboarding is completed
 * @returns {boolean} True if onboarding is completed
 */
export function isOnboardingCompleted() {
  return getOnboardingStatus() === ONBOARDING_STATUS.COMPLETED;
}

/**
 * Check if onboarding is in progress
 * @returns {boolean} True if onboarding is in progress
 */
export function isOnboardingInProgress() {
  return getOnboardingStatus() === ONBOARDING_STATUS.IN_PROGRESS;
}

/**
 * Initialize onboarding with source and step
 * @param {string} source - Source of onboarding
 * @param {number} step - Starting step
 */
export function initializeOnboarding(source = 'manual', step = 0) {
  setOnboardingStatus(ONBOARDING_STATUS.IN_PROGRESS);
  setOnboardingStep(step);
  setOnboardingSource(source);
}

/**
 * Complete onboarding
 */
export function completeOnboarding() {
  setOnboardingStatus(ONBOARDING_STATUS.COMPLETED);
  setOnboardingStep(ONBOARDING_STEPS.COMPLETE);
}

/**
 * Reset onboarding to start over
 */
export function resetOnboarding() {
  clearOnboardingData();
  initializeOnboarding('manual', ONBOARDING_STEPS.WELCOME);
}

/**
 * Backup profile data to localStorage for fallback
 * @param {object} profileData - Profile data to backup
 */
export function backupProfileData(profileData) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ONBOARDING_PROFILE_BACKUP_KEY, JSON.stringify(profileData));
  } catch (error) {
    console.warn('Failed to backup profile data:', error);
  }
}

/**
 * Get backed up profile data from localStorage
 * @returns {object|null} Backed up profile data or null
 */
export function getBackedUpProfileData() {
  if (typeof window === 'undefined') return null;
  try {
    const backedUp = localStorage.getItem(ONBOARDING_PROFILE_BACKUP_KEY);
    return backedUp ? JSON.parse(backedUp) : null;
  } catch (error) {
    console.warn('Failed to retrieve backed up profile data:', error);
    return null;
  }
}

/**
 * Mark database operations as failed
 */
export function markDatabaseOperationsFailed() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ONBOARDING_DB_FAILED_KEY, 'true');
}

/**
 * Check if database operations have failed
 * @returns {boolean} True if database operations failed
 */
export function hasDatabaseOperationsFailed() {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_DB_FAILED_KEY) === 'true';
}

/**
 * Clear database failure flag
 */
export function clearDatabaseFailureFlag() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_DB_FAILED_KEY);
}

/**
 * Clear backed up profile data
 */
export function clearBackedUpProfileData() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ONBOARDING_PROFILE_BACKUP_KEY);
}
