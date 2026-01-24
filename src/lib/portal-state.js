'use client'

const STORAGE_KEY = 'active_portal_uuid'

/**
 * Internal cache (avoids repeated localStorage reads)
 */
let activePortalUuid = null
let availablePortals = []

/* -------------------------------------
   Helpers
------------------------------------- */

function isValidUuid(uuid) {
  return typeof uuid === 'string' && uuid.length > 0
}

function syncToStorage(uuid) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, uuid)
}

function readFromStorage() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEY)
}

/* -------------------------------------
   Public API
------------------------------------- */

/**
 * Initialise portal state
 * Must be called once after portals are known (e.g. after fetch)
 */
export function initPortalState(portals) {
  if (!Array.isArray(portals) || portals.length === 0) {
    throw new Error('initPortalState requires at least one portal')
  }

  availablePortals = portals

  const stored = readFromStorage()
  const exists = portals.some(p => p.uuid === stored)

  const resolved = exists
    ? stored
    : portals[0].uuid

  activePortalUuid = resolved
  syncToStorage(resolved)

  return resolved
}

/**
 * Get active portal UUID
 * Guaranteed non-null after init
 */
export function getActivePortalUuid() {
  if (!isValidUuid(activePortalUuid)) {
    throw new Error('Portal state not initialised')
  }

  return activePortalUuid
}

/**
 * Change active portal
 */
export function setActivePortal(uuid) {
  if (!isValidUuid(uuid)) {
    throw new Error('Invalid portal UUID')
  }

  const exists = availablePortals.some(p => p.uuid === uuid)
  if (!exists) {
    throw new Error('Portal does not exist')
  }

  activePortalUuid = uuid
  syncToStorage(uuid)

  return uuid
}

/**
 * Get full active portal object
 */
export function getActivePortal() {
  const uuid = getActivePortalUuid()
  return availablePortals.find(p => p.uuid === uuid)
}

/**
 * Return available portals for rendering
 */
export function getAvailablePortals() {
  return [...availablePortals]
}
