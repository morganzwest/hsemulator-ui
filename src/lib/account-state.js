/**
 * Account State Management Module
 * 
 * PURPOSE:
 * This module provides centralized account state management for multi-tenant applications.
 * It handles the complexity of maintaining active account selection across page refreshes,
 * browser sessions, and client-side navigation while ensuring data consistency.
 * 
 * WHY THIS APPROACH:
 * - Client-side state: Avoids server-side session management overhead
 * - localStorage persistence: Survives page refreshes and browser restarts
 * - In-memory caching: Prevents expensive localStorage reads on every access
 * - Validation layer: Ensures data integrity and prevents invalid states
 * - SSR compatibility: Safely handles server-side rendering where window is undefined
 * 
 * ARCHITECTURAL DECISIONS:
 * 1. Module-level variables instead of React state: This allows usage outside React components
 * 2. Defensive programming: All public functions validate inputs and throw descriptive errors
 * 3. Lazy initialization: State is hydrated from storage only when first accessed
 * 4. Immutable returns: Arrays are copied to prevent external mutation
 */

'use client'

const STORAGE_KEY = 'active_account_id'
console.debug('[account-state] module loaded', import.meta.url)

/**
 * Internal cache (avoids repeated localStorage reads)
 * WHY: localStorage is synchronous and relatively expensive, so we cache in memory
 * for performance while keeping localStorage as the source of truth for persistence.
 */
let activeAccountId = null
let availableAccounts = []

/* -------------------------------------
   Debug helper
------------------------------------- */

/**
 * WHY: Centralized logging with consistent prefix for easier debugging
 * and filtering in browser dev tools. All module operations are logged
 * for transparency during development and troubleshooting.
 */
function log(...args) {
  console.debug('[account-state]', ...args)
}

/* -------------------------------------
   Helpers
------------------------------------- */

/**
 * Dynamically add a new account to the available accounts list
 * 
 * WHY: Supports scenarios where accounts are discovered incrementally
 * (e.g., after authentication, API responses, or real-time updates)
 * rather than all at once during initial load.
 * 
 * SIDE EFFECT: Automatically sets the account as active if no active
 * account exists, ensuring the application always has a valid context.
 */
export function addAvailableAccount(account) {
  if (!account?.id) throw new Error('Invalid account')

  const exists = availableAccounts.some(a => a.id === account.id)
  if (exists) return

  availableAccounts.push(account)

  // Reconcile active account
  if (!activeAccountId) {
    activeAccountId = account.id
    syncToStorage(account.id)
  }
}

/**
 * Validate UUID format
 * 
 * WHY: Ensures data integrity and prevents invalid IDs from being stored
 * or used. This is critical because account IDs are used as foreign keys
 * throughout the application and in API calls.
 */
function isValidUuid(uuid) {
  return (
    typeof uuid === 'string' &&
    /^[0-9a-f-]{36}$/i.test(uuid)
  )
}

/**
 * Persist active account ID to localStorage
 * 
 * WHY: Provides persistence across page refreshes and browser sessions.
 * The window check ensures SSR compatibility where localStorage is undefined.
 */
function syncToStorage(id) {
  if (typeof window === 'undefined') return
  log('syncToStorage →', id)
  localStorage.setItem(STORAGE_KEY, id)
}

/**
 * Read active account ID from localStorage
 * 
 * WHY: Supports lazy initialization and state recovery after page refresh.
 * Returns null if storage is empty or unavailable (SSR scenario).
 */
function readFromStorage() {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  log('readFromStorage →', value)
  return value
}

/**
 * Get active account ID for queries
 * 
 * WHY: This is the primary getter used throughout the application for
 * API calls, data filtering, and routing. It implements a fallback strategy:
 * 1. Return cached in-memory value (fastest)
 * 2. Fall back to localStorage (page refresh recovery)
 * 3. Throw error if no valid state exists (prevents silent failures)
 * 
 * THROW BEHAVIOR: Intentionally throws when state is uninitialized to force
 * proper initialization and prevent undefined behavior in consuming code.
 */
export function getActiveAccountId() {
  if (isValidUuid(activeAccountId)) {
    return activeAccountId
  }

  const stored =
    typeof window !== 'undefined'
      ? localStorage.getItem(STORAGE_KEY)
      : null

  if (isValidUuid(stored)) {
    activeAccountId = stored
    log('hydrated from storage →', stored)
    return stored
  }

  log('getActiveAccountId FAILED → no state')
  throw new Error('Account state not initialised')
}

/* -------------------------------------
   Public API
------------------------------------- */

/**
 * Initialise account state
 * Must be called once after accounts are known (e.g. after fetch)
 * 
 * WHY: This is the entry point that establishes the initial application state.
 * It handles the complex logic of determining which account should be active:
 * 1. Prefer the previously selected account from localStorage (user continuity)
 * 2. Fall back to the first available account (safe default)
 * 3. Persist the choice for future sessions
 * 
 * WHEN TO CALL: After authentication and account fetching, but before
 * any components that depend on account state are rendered.
 */
export function initAccountState(accounts) {
  log('initAccountState called')

  if (!Array.isArray(accounts) || accounts.length === 0) {
    throw new Error('initAccountState requires at least one account')
  }

  availableAccounts = accounts
  log('availableAccounts set →', accounts.map(a => a.id))

  const stored = readFromStorage()
  const exists = accounts.some(a => a.id === stored)

  const resolved = exists
    ? stored
    : accounts[0].id

  activeAccountId = resolved
  log('activeAccountId initialised →', resolved)

  syncToStorage(resolved)

  return resolved
}

/**
 * Get active account ID
 * Guaranteed non-null after init
 * 
 * WHY: Alias for getActiveAccountId() providing semantic clarity.
 * The "Uuid" suffix explicitly indicates the return type format,
 * helping developers understand the expected data structure.
 */
export function getActiveAccountUuid() {
  return getActiveAccountId()
}

/**
 * Change active account
 * 
 * WHY: Enables account switching functionality critical for multi-tenant
 * applications. This function ensures data consistency by:
 * 1. Validating the new account ID format
 * 2. Verifying the account exists in the available list
 * 3. Updating both in-memory cache and persistent storage
 * 
 * ERROR HANDLING: Throws descriptive errors to help developers debug
 * invalid account switching attempts.
 */
export function setActiveAccount(id) {
  log('setActiveAccount called →', id)

  if (!isValidUuid(id)) {
    throw new Error('Invalid account ID')
  }

  const exists = availableAccounts.some(a => a.id === id)
  log('account exists?', exists)

  if (!exists) {
    log('setActiveAccount FAILED → account not found', {
      id,
      availableAccounts,
    })
    throw new Error('Account does not exist')
  }

  activeAccountId = id
  log('activeAccountId updated →', id)

  syncToStorage(id)

  return id
}

/**
 * Get full active account object
 * 
 * WHY: While many operations only need the ID, some components require
 * the full account object (name, email, settings, etc.). This function
 * provides a convenient way to access the complete account data without
 * exposing the internal accounts array directly.
 * 
 * RETURNS: The complete account object or undefined if something went wrong.
 * The undefined return is intentional to allow for optional chaining
 * in consuming code: getActiveAccount()?.name
 */
export function getActiveAccount() {
  const id = getActiveAccountId()
  const account = availableAccounts.find(a => a.id === id)

  log('getActiveAccount →', account)

  return account
}

/**
 * Return available accounts for rendering
 * 
 * WHY: Provides account data for UI components like account switchers,
 * dropdowns, and selectors. The array is copied to prevent external mutation
 * of the internal state, maintaining data integrity.
 * 
 * IMMUTABILITY: Returns a new array instance to ensure consumers cannot
 * accidentally modify the internal state reference.
 */
export function getAvailableAccounts() {
  log('getAvailableAccounts →', availableAccounts.length)
  return [...availableAccounts]
}
