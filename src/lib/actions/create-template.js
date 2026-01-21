import YAML from 'yaml'

const MAX_NAME = 64
const MAX_DESC = 256

/**
 * Create an action from a read-only template.
 *
 * Required template fields:
 * - js_action
 * - py_action
 * - event_json
 * - config_yaml_js
 * - config_yaml_py
 */
export async function createActionFromTemplate({
  supabase,
  ownerId,
  portalId,
  template,
  language,
  name,
  description,
}) {
  if (!template) {
    throw new Error('Template is required')
  }

  if (!language || !['javascript', 'python'].includes(language)) {
    throw new Error('Invalid language selection')
  }

  if (!name || name.length > MAX_NAME) {
    throw new Error('Invalid name')
  }

  if (description && description.length > MAX_DESC) {
    throw new Error('Invalid description')
  }

  /* -------------------------------------
     Resolve template files
  ------------------------------------- */

  const actionSource =
    language === 'javascript'
      ? template.js_action
      : template.py_action

  const configYaml =
    language === 'javascript'
      ? template.config_yaml_js
      : template.config_yaml_py

  if (!actionSource) {
    throw new Error(`Template does not support ${language}`)
  }

  if (!configYaml) {
    throw new Error(`Missing config for ${language}`)
  }

  if (!template.event_json) {
    throw new Error('Template missing event.json')
  }

  /* -------------------------------------
     Create action record
  ------------------------------------- */

  const { data: action, error } = await supabase
    .from('actions')
    .insert({
      owner_id: ownerId,
      portal_id: portalId,
      name,
      description,
      language,
      filepath: '',
      config: YAML.parse(configYaml),
      template_id: template.id ?? null,
    })
    .select()
    .single()

  if (error) throw error

  /* -------------------------------------
     Write files to storage
  ------------------------------------- */

  const basePath = `${ownerId}/${action.id}`

  const files = {
    'config.yaml': configYaml,
    'event.json': JSON.stringify(template.event_json, null, 2),
    [language === 'javascript' ? 'action.js' : 'action.py']: actionSource,
  }

  for (const [path, contents] of Object.entries(files)) {
    const { error: uploadError } = await supabase.storage
      .from('actions')
      .upload(`${basePath}/${path}`, contents, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) throw uploadError
  }

  /* -------------------------------------
     Notify UI
  ------------------------------------- */

  window.dispatchEvent(new Event('actions:resync'))

  return action
}
