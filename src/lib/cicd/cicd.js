import { createSupabaseBrowserClient } from '@/lib/supabase/browser'
import { logger } from '@/lib/logger'
import { ERROR_MESSAGES } from '@/lib/errors'

/* ----------------------------------------
   Fetch existing CI/CD config
---------------------------------------- */

export async function fetchCICDConfig(actionId, portalId) {
  const supabase = createSupabaseBrowserClient()

  const [{ data: action, error: actionError }, { data: portal, error: portalError }, { data: secrets, error: secretsError }] = await Promise.all([
    supabase
      .from('actions')
      .select('workflow_id, cicd_search_token')
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
      .single(),
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
    secretName: action?.cicd_search_token || '',
    token: portal?.cicd_token || null, // never expose raw value
    cicdSecret: cicdSecret || null,
  }
}

/* ----------------------------------------
   Persist CI/CD config
---------------------------------------- */

export async function saveCICDConfig({
  actionId,
  portalId,
  workflowId,
  secretName,
  token,
}) {
  const supabase = createSupabaseBrowserClient()

  const updates = []

  updates.push(
    supabase
      .from('actions')
      .update({
        workflow_id: workflowId,
        cicd_search_token: secretName,
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
export async function checkWorkflowStatus({
  workflowId,
  cicdSecretId,
  searchKey,
  sourceCode,
}) {
  // Validate required parameters
  if (!workflowId || !cicdSecretId || !searchKey) {
    throw new Error(ERROR_MESSAGES.MISSING_PARAMETERS(['workflow_id', 'cicd_secret_id', 'search_key']))
  }

  const requestBody = {
    cicd_secret_id: cicdSecretId,
    search_key: searchKey,
    workflow_id: workflowId,
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
    throw new Error(json.error || ERROR_MESSAGES.FAILED_TO_CHECK_STATUS)
  }

  return json
}

export async function promoteAction({
  workflowId,
  secretName,
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
      search_key: secretName,
      force,
      dry_run: dryRun,
    }),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.error || ERROR_MESSAGES.PROMOTION_FAILED)
  }

  return json
}
