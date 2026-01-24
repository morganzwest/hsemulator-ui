'use client'

const STORAGE_KEY = 'active_portal_uuid'
console.debug('[portal-state] module loaded', import.meta.url)

/**
 * Internal cache (avoids repeated localStorage reads)
 */
let activePortalUuid = null
let availablePortals = []

/* -------------------------------------
   Debug helper
------------------------------------- */

function log(...args) {
  console.debug('[portal-state]', ...args)
}

/* -------------------------------------
   Helpers
------------------------------------- */

export function addAvailablePortal(portal) {
  if (!portal?.uuid) {
    throw new Error('Invalid portal')
  }

  const exists = availablePortals.some(p => p.uuid === portal.uuid)
  if (exists) return

  availablePortals.push(portal)
}


function isValidUuid(uuid) {
  return typeof uuid === 'string' && uuid.length > 0
}

function syncToStorage(uuid) {
  if (typeof window === 'undefined') return
  log('syncToStorage →', uuid)
  localStorage.setItem(STORAGE_KEY, uuid)
}

function readFromStorage() {
  if (typeof window === 'undefined') return null
  const value = localStorage.getItem(STORAGE_KEY)
  log('readFromStorage →', value)
  return value
}

/**
 * Get active portal UUID for queries
 * Alias for clarity when used in data fetching
 */
export function getActivePortalId() {
  const id = getActivePortalUuid()
  log('getActivePortalId →', id)
  return id
}

/* -------------------------------------
   Public API
------------------------------------- */

/**
 * Initialise portal state
 * Must be called once after portals are known (e.g. after fetch)
 */
export function initPortalState(portals) {
  log('initPortalState called')

  if (!Array.isArray(portals) || portals.length === 0) {
    throw new Error('initPortalState requires at least one portal')
  }

  availablePortals = portals
  log('availablePortals set →', portals.map(p => p.uuid))

  const stored = readFromStorage()
  const exists = portals.some(p => p.uuid === stored)

  const resolved = exists
    ? stored
    : portals[0].uuid

  activePortalUuid = resolved
  log('activePortalUuid initialised →', resolved)

  syncToStorage(resolved)

  return resolved
}

/**
 * Get active portal UUID
 * Guaranteed non-null after init
 */
export function getActivePortalUuid() {
  if (!isValidUuid(activePortalUuid)) {
    log('getActivePortalUuid FAILED → state not initialised', {
      activePortalUuid,
      availablePortals,
    })
    throw new Error('Portal state not initialised')
  }

  log('getActivePortalUuid →', activePortalUuid)
  return activePortalUuid
}

/**
 * Change active portal
 */
export function setActivePortal(uuid) {
  log('setActivePortal called →', uuid)

  if (!isValidUuid(uuid)) {
    throw new Error('Invalid portal UUID')
  }

  const exists = availablePortals.some(p => p.uuid === uuid)
  log('portal exists?', exists)

  if (!exists) {
    log('setActivePortal FAILED → portal not found', {
      uuid,
      availablePortals,
    })
    throw new Error('Portal does not exist')
  }

  activePortalUuid = uuid
  log('activePortalUuid updated →', uuid)

  syncToStorage(uuid)

  return uuid
}

/**
 * Get full active portal object
 */
export function getActivePortal() {
  const uuid = getActivePortalUuid()
  const portal = availablePortals.find(p => p.uuid === uuid)

  log('getActivePortal →', portal)

  return portal
}

/**
 * Return available portals for rendering
 */
export function getAvailablePortals() {
  log('getAvailablePortals →', availablePortals.length)
  return [...availablePortals]
}
