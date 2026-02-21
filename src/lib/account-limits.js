'use client'

import { createSupabaseBrowserClient } from './supabase/browser'
import { getActiveAccountId } from './account-state'

function getSupabaseClient() {
  return createSupabaseBrowserClient()
}

/**
 * Error classes for account limits
 */
export class AccountLimitError extends Error {
  constructor(message, type, accountUsage = null) {
    super(message)
    this.name = 'AccountLimitError'
    this.type = type // 'portal' | 'user'
    this.accountUsage = accountUsage
  }
}

/**
 * Check if account can create a new portal
 * @param {string} accountId - Account UUID (optional, uses active account if not provided)
 * @returns {Promise<boolean>} - True if portal can be created
 */
export async function isAbleToAddPortal(accountId = null) {
  try {
    const targetAccountId = accountId || getActiveAccountId()

    const { data, error } = await getSupabaseClient()
      .rpc('can_create_portal', { account_id: targetAccountId })

    if (error) {
      console.error('[account-limits] Error checking portal limit:', error)
      throw new AccountLimitError(
        'Failed to check portal limit',
        'portal',
        null
      )
    }

    return data || false
  } catch (err) {
    if (err instanceof AccountLimitError) {
      throw err
    }
    console.error('[account-limits] Unexpected error:', err)
    throw new AccountLimitError(
      'An unexpected error occurred while checking portal limits',
      'portal',
      null
    )
  }
}

/**
 * Check if account can add a new user
 * @param {string} accountId - Account UUID (optional, uses active account if not provided)
 * @returns {Promise<boolean>} - True if user can be added
 */
export async function isAbleToAddUser(accountId = null) {
  try {
    const targetAccountId = accountId || getActiveAccountId()

    const { data, error } = await getSupabaseClient()
      .rpc('can_add_user', { account_id: targetAccountId })

    if (error) {
      console.error('[account-limits] Error checking user limit:', error)
      throw new AccountLimitError(
        'Failed to check user limit',
        'user',
        null
      )
    }

    return data || false
  } catch (err) {
    if (err instanceof AccountLimitError) {
      throw err
    }
    console.error('[account-limits] Unexpected error:', err)
    throw new AccountLimitError(
      'An unexpected error occurred while checking user limits',
      'user',
      null
    )
  }
}

/**
 * Get comprehensive account limits and usage
 * @param {string} accountId - Account UUID (optional, uses active account if not provided)
 * @returns {Promise<Object>} - Account limits and usage data
 */
export async function getAccountLimits(accountId = null) {
  try {
    const targetAccountId = accountId || getActiveAccountId()

    const { data, error } = await getSupabaseClient()
      .rpc('get_account_usage', { account_id: targetAccountId })

    if (error) {
      console.error('[account-limits] Error getting account usage:', error)
      throw new AccountLimitError(
        'Failed to get account limits',
        'general',
        null
      )
    }

    return data || {}
  } catch (err) {
    if (err instanceof AccountLimitError) {
      throw err
    }
    console.error('[account-limits] Unexpected error:', err)
    throw new AccountLimitError(
      'An unexpected error occurred while getting account limits',
      'general',
      null
    )
  }
}

/**
 * Unified limit checker for any operation type
 * @param {string} operationType - 'portal' | 'user'
 * @param {string} accountId - Account UUID (optional, uses active account if not provided)
 * @returns {Promise<boolean>} - True if operation is allowed
 */
export async function checkLimitsBeforeOperation(operationType, accountId = null) {
  switch (operationType) {
    case 'portal':
      return await isAbleToAddPortal(accountId)
    case 'user':
      return await isAbleToAddUser(accountId)
    default:
      throw new AccountLimitError(
        `Unknown operation type: ${operationType}`,
        'general',
        null
      )
  }
}

/**
 * Get user-friendly error message for limit exceeded
 * @param {AccountLimitError} error - The limit error
 * @returns {string} - User-friendly message
 */
export function getLimitErrorMessage(error) {
  if (!(error instanceof AccountLimitError)) {
    return error.message
  }

  const usage = error.accountUsage
  const type = error.type

  if (type === 'portal') {
    const maxPortals = usage?.max_portals || 'your plan limit'
    return `You've reached your portal limit (${maxPortals}). Upgrade your plan to create more portals.`
  }

  if (type === 'user') {
    const maxUsers = usage?.max_users || 'your plan limit'
    return `You've reached your user limit (${maxUsers}). Upgrade your plan to add more users.`
  }

  return error.message
}

/**
 * Get upgrade URL based on current plan
 * @param {string} currentPlan - Current plan ('free' | 'pro')
 * @returns {string} - Upgrade URL
 */
export function getUpgradeUrl(currentPlan) {
  if (currentPlan === 'free') {
    return '/pricing?upgrade=pro'
  }
  if (currentPlan === 'pro') {
    return '/pricing?upgrade=enterprise'
  }
  return '/pricing'
}

/**
 * Check limits and provide complete response with upgrade info
 * @param {string} operationType - 'portal' | 'user'
 * @param {string} accountId - Account UUID (optional)
 * @returns {Promise<Object>} - Complete response with canProceed, error, upgradeUrl
 */
export async function checkLimitsWithUpgradeInfo(operationType, accountId = null) {
  try {
    const canProceed = await checkLimitsBeforeOperation(operationType, accountId)
    const limits = await getAccountLimits(accountId)

    return {
      canProceed,
      error: null,
      upgradeUrl: canProceed ? null : getUpgradeUrl(limits.plan),
      limits,
      operationType
    }
  } catch (error) {
    const limits = error.accountUsage || {}

    return {
      canProceed: false,
      error: getLimitErrorMessage(error),
      upgradeUrl: getUpgradeUrl(limits.plan),
      limits,
      operationType
    }
  }
}

// Export types for TypeScript users
export const AccountLimitTypes = {
  PORTAL: 'portal',
  USER: 'user'
}

const accountLimits = {
  isAbleToAddPortal,
  isAbleToAddUser,
  getAccountLimits,
  checkLimitsBeforeOperation,
  checkLimitsWithUpgradeInfo,
  getLimitErrorMessage,
  getUpgradeUrl,
  AccountLimitError,
  AccountLimitTypes
}

export default accountLimits
