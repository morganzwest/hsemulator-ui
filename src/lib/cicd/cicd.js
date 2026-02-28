import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { ERROR_MESSAGES } from '@/lib/errors'

/* ----------------------------------------
   Fetch existing CI/CD config
---------------------------------------- */

/**
 * Fetches existing CI/CD configuration from the database for a given action and portal
 * 
 * @param {string} actionId - The ID of the action to fetch configuration for
 * @param {string} portalId - The ID of the portal to fetch configuration for
 * @returns {Promise<Object>} Configuration object containing workflow settings
 * @returns {string} returns.workflowId - The configured workflow ID
 * @returns {string} returns.actionId - The configured action ID
 * @returns {string|null} returns.token - The masked CI/CD token (never exposed raw)
 * @returns {Object|null} returns.cicdSecret - The CICD secret object if found
 * 
 * @example
 * const config = await fetchCICDConfig('action-123', 'portal-456');
 * console.log(config.workflowId); // '123456789'
 * console.log(config.cicdSecret); // { id: 'secret-789', name: 'my-secret', scope: 'cicd' }
 */
export async function fetchCICDConfig(actionId, portalId) {
  const supabase = createSupabaseBrowserClient()

  const [{ data: action, error: actionError }, { data: portal, error: portalError }, { data: secrets, error: secretsError }] = await Promise.all([
    supabase
      .from('actions')
      .select('workflow_id, action_id')
      .eq('id', actionId)
      .single(),

    supabase
      .from('portals')
      .select('cicd_token')
      .eq('uuid', portalId)
      .single(),

    supabase
      .from('secrets')
      .select('id, name, scope')
      .eq('portal_id', portalId)
      .eq('scope', 'cicd')
      .maybeSingle(),
  ])

  // Handle errors appropriately
  if (actionError) {
    logger.error('Failed to fetch action config:', actionError)
    // Don't throw for action errors, just return empty values
  }

  if (portalError) {
    logger.error('Failed to fetch portal config:', portalError)
    // Don't throw for portal errors, just return empty values
  }

  if (secretsError) {
    logger.error('Failed to fetch secrets:', secretsError)
    // Don't throw for secrets errors, just return empty values
  }

  // Find CICD-scoped secret (only if query succeeded)
  const cicdSecret = secretsError ? null : secrets

  return {
    workflowId: action?.workflow_id || '',
    actionId: action?.action_id || '',
    token: portal?.cicd_token || null, // never expose raw value
    cicdSecret: cicdSecret || null,
  }
}

/* ----------------------------------------
   Persist CI/CD config
---------------------------------------- */

/**
 * Persists CI/CD configuration to the database for a given action and portal
 * 
 * @param {Object} config - Configuration object to save
 * @param {string} config.actionId - The ID of the action to save configuration for
 * @param {string} config.portalId - The ID of the portal to save configuration for
 * @param {string} config.workflowId - The workflow ID to save
 * @param {string} config.secretName - The secret name (legacy, typically empty)
 * @param {string} config.selectedActionId - The selected action ID to save
 * @param {string} [config.token] - Optional new CI/CD token to save
 * 
 * @returns {Promise<void>}
 * 
 * @throws {Error} When database update fails
 * 
 * @example
 * await saveCICDConfig({
 *   actionId: 'action-123',
 *   portalId: 'portal-456',
 *   workflowId: '123456789',
 *   secretName: '',
 *   selectedActionId: 'action-789',
 *   token: 'new-token-123'
 * });
 */
export async function saveCICDConfig({
  actionId,
  portalId,
  workflowId,
  secretName,
  selectedActionId,
  token,
}) {
  const supabase = createSupabaseBrowserClient()

  const updates = []

  updates.push(
    supabase
      .from('actions')
      .update({
        workflow_id: workflowId,
        action_id: selectedActionId,
      })
      .eq('id', actionId)
  )

  if (token) {
    updates.push(
      supabase
        .from('portals')
        .update({ cicd_token: token })
        .eq('uuid', portalId)
    )
  }

  const results = await Promise.all(updates)

  const error = results.find(r => r.error)?.error
  if (error) throw error
}

/**
 * Infers the runtime environment from source code patterns
 * 
 * @param {string} sourceCode - The source code to analyze
 * @returns {string} The inferred runtime environment ('PYTHON39' or 'NODE20X')
 * 
 * @example
 * const runtime = inferRuntimeFromSource('def handler(): return "Hello"');
 * // Returns 'PYTHON39'
 * 
 * const runtime = inferRuntimeFromSource('function handler() { return "Hello"; }');
 * // Returns 'NODE20X'
 */
function inferRuntimeFromSource(sourceCode) {
  // Very explicit Python signals
  if (
    /^\s*def\s+\w+\s*\(/m.test(sourceCode) ||
    /^\s*import\s+\w+/m.test(sourceCode) ||
    sourceCode.includes('requests.') ||
    sourceCode.includes('os.environ')
  ) {
    return 'PYTHON39'
  }

  // Default to Node
  return 'NODE20X'
}


/* ----------------------------------------
   Promote to runtime
---------------------------------------- */
/**
 * Checks the status of a workflow action by comparing source code with deployed version
 * 
 * @param {Object} params - Status check parameters
 * @param {string} params.workflowId - The workflow ID to check
 * @param {string} params.cicdSecretId - The CICD secret ID for authentication
 * @param {string} params.actionId - The action ID to check status for
 * @param {string} [params.sourceCode] - Optional source code to compare against
 * 
 * @returns {Promise<Object>} Status response object with workflow state information
 * 
 * @throws {Error} When required parameters are missing
 * @throws {Error} When API request fails
 * 
 * @example
 * const status = await checkWorkflowStatus({
 *   workflowId: '123456789',
 *   cicdSecretId: 'secret-123',
 *   actionId: 'action-456',
 *   sourceCode: 'function handler() { return "Hello"; }'
 * });
 * console.log(status.status); // 'in_sync', 'out_of_sync', etc.
 */
export async function checkWorkflowStatus({
  workflowId,
  cicdSecretId,
  sourceCode,
  actionId,
}) {
  // Validate required parameters
  if (!workflowId || !cicdSecretId || !actionId) {
    throw new Error(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id', 'cicd_secret_id', 'action_id']))
  }

  const requestBody = {
    cicd_secret_id: cicdSecretId,
    workflow_id: workflowId,
    action_id: actionId,
  }

  if (sourceCode) {
    requestBody.source_code = sourceCode
  }

  const res = await fetch(`/api/cicd/workflow/${workflowId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  const json = await res.json()

  if (!res.ok) {
    const error = new Error(json.error || ERROR_MESSAGES.FAILED_TO_CHECK_STATUS)
    error.status = res.status
    throw error
  }

  return json
}

/**
 * Fetches detailed workflow information including available actions from the runtime service
 * 
 * @param {string} workflowId - The workflow ID to fetch details for
 * @param {string} [cicdSecretId] - Optional CICD secret ID for authentication
 * 
 * @returns {Promise<Object>} Workflow details object containing actions and metadata
 * @returns {Array} returns.actions - Array of available actions in the workflow
 * 
 * @throws {Error} When workflow is not found (404)
 * @throws {Error} When access is denied (403)
 * @throws {Error} When authentication is required (401)
 * @throws {Error} When API endpoint is not available (404)
 * @throws {Error} When request fails for other reasons
 * 
 * @example
 * const workflow = await fetchWorkflowDetails('123456789', 'secret-123');
 * console.log(workflow.actions.length); // Number of actions in workflow
 * console.log(workflow.actions[0].action_id); // ID of first action
 */
export async function fetchWorkflowDetails(workflowId, cicdSecretId) {
  try {
    // Build URL with cicd_secret_id parameter
    const url = cicdSecretId
      ? `/api/cicd/workflow/${workflowId}?cicd_secret_id=${cicdSecretId}`
      : `/api/cicd/workflow/${workflowId}`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorText = await res.text()
      logger.error('[fetchWorkflowDetails] API Error:', {
        status: res.status,
        statusText: res.statusText,
        errorText: errorText,
        workflowId
      })

      if (res.status === 403) {
        throw new Error('Access denied. You may not have permission to access this resource.')
      } else if (res.status === 401) {
        throw new Error('Authentication required. Please log in and try again.')
      } else if (res.status === 404) {
        throw new Error('Workflow endpoint not found. The feature may not be available yet.')
      } else {
        throw new Error(`Failed to fetch workflow: ${res.status} ${res.statusText}`)
      }
    }

    const json = await res.json()
    logger.log('[fetchWorkflowDetails] Success:', { workflowId, actionCount: json.actions?.length })
    return json
  } catch (err) {
    logger.error('[fetchWorkflowDetails] Error:', err)
    throw err
  }
}

/**
 * Promotes/deployes an action to a HubSpot workflow with optional force and dry-run modes
 * 
 * @param {Object} params - Promotion parameters
 * @param {string} params.workflowId - The workflow ID to promote to
 * @param {string} params.actionId - The action ID to promote
 * @param {string|null} params.hubspotToken - HubSpot authentication token (null if using CICD secret)
 * @param {string} params.sourceCode - The source code to deploy
 * @param {string} [params.cicdSecretId] - Optional CICD secret ID for authentication
 * @param {string} [params.runtime] - Optional runtime environment override
 * @param {boolean} [params.force=false] - Whether to force deployment even if unmanaged
 * @param {boolean} [params.dryRun=false] - Whether to perform a dry run without actual deployment
 * 
 * @returns {Promise<Object>} Promotion response object with deployment status
 * 
 * @throws {Error} When promotion request fails
 * 
 * @example
 * const result = await promoteAction({
 *   workflowId: '123456789',
 *   actionId: 'action-456',
 *   hubspotToken: null,
 *   sourceCode: 'function handler() { return "Hello"; }',
 *   cicdSecretId: 'secret-123',
 *   force: false,
 *   dryRun: false
 * });
 * console.log(result.status); // 'success', 'noop', etc.
 */
export async function promoteAction({
  workflowId,
  actionId,
  hubspotToken,
  sourceCode,
  cicdSecretId,
  runtime, // optional override
  force = false,
  dryRun = false,
}) {
  // Use new API route that proxies to runtime service
  const res = await fetch('/api/cicd/promote', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      source_code: sourceCode,
      cicd_secret_id: cicdSecretId,
      workflow_id: workflowId,
      action_id: actionId,
      force,
      dry_run: dryRun,
      ...(hubspotToken && { hubspot_token: hubspotToken }),
      ...(runtime && { runtime }),
    }),
  })

  const json = await res.json()

  if (!res.ok) {
    const error = new Error(json.error || ERROR_MESSAGES.PROMOTION_FAILED)
    error.status = res.status
    throw error
  }

  return json
}
