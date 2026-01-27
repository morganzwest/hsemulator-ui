import { createSupabaseBrowserClient } from '@/lib/supabase/browser'

/* ----------------------------------------
   Fetch existing CI/CD config
---------------------------------------- */

export async function fetchCICDConfig(actionId, portalId) {
  const supabase = createSupabaseBrowserClient()

  const [{ data: action }, { data: portal }] = await Promise.all([
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
  ])

  return {
    workflowId: action?.workflow_id || '',
    secretName: action?.cicd_search_token || '',
    token: portal?.cicd_token || null, // never expose raw value
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
export async function promoteAction({
  workflowId,
  secretName,
  hubspotToken,
  sourceCode,
  runtime, // optional override
  force = false,
  dryRun = false,
}) {
  if (!hubspotToken) {
    throw new Error('hubspot_token is required for promotion')
  }

  const resolvedRuntime =
    runtime ?? inferRuntimeFromSource(sourceCode)

  const apiKey =
    process.env.NEXT_SECRET_RUNTIME_API_KEY || 'dev_secret_key'

  const res = await fetch(
    'https://hsemulator-712737660959.europe-west1.run.app/promote',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        hubspot_token: hubspotToken,
        workflow_id: workflowId,
        selector: {
          type: 'secret',
          value: secretName,
        },
        runtime: resolvedRuntime,
        source_code: sourceCode,
        force,
        dry_run: dryRun,
      }),
    }
  )

  const json = await res.json()

  if (!res.ok || json.ok === false) {
    throw new Error(json.error || 'Promotion failed')
  }

  return json
}
