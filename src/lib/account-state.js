'use client'

const STORAGE_KEY = 'active_account_id'
console.debug('[account-state] module loaded', import.meta.url)

/**
 * Internal cache (avoids repeated localStorage reads)
 */
let activeAccountId = null
let availableAccounts = []

/* -------------------------------------
   Debug helper
------------------------------------- */

function log(...args) {
  console.debug('[account-state]', ...args)
}

/* -------------------------------------
   Helpers
------------------------------------- */

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

function isValidUuid(uuid) {
  return (
    typeof uuid === 'string' &&
    /^[0-9a-f-]{36}$/i.test(uuid)
  )
}

function syncToStorage(id) {
  if (typeof window === 'undefined') return
  log('syncToStorage →', id)
  localStorage.setItem(STORAGE_KEY, id)
}

function readFromStorage() {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  log('readFromStorage →', value)
  return value
}

/**
 * Get active account ID for queries
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
 */
export function getActiveAccountUuid() {
  return getActiveAccountId()
}

/**
 * Change active account
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
 */
export function getActiveAccount() {
  const id = getActiveAccountId()
  const account = availableAccounts.find(a => a.id === id)

  log('getActiveAccount →', account)

  return account
}

/**
 * Return available accounts for rendering
 */
export function getAvailableAccounts() {
  log('getAvailableAccounts →', availableAccounts.length)
  return [...availableAccounts]
}
