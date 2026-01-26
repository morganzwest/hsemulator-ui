import YAML from 'yaml'
import { toast } from 'sonner'

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
  /* -------------------------------------
     Validation (Warnings / Errors)
  ------------------------------------- */

  if (!template) {
    toast.error('Template is required')
    throw new Error('Missing template')
  }

  if (!language || !['javascript', 'python'].includes(language)) {
    toast.warning('Please select a valid language')
    throw new Error('Invalid language selection')
  }

  if (!name) {
    toast.warning('Action name is required')
    throw new Error('Missing name')
  }

  if (name.length > MAX_NAME) {
    toast.warning(`Action name must be ≤ ${MAX_NAME} characters`)
    throw new Error('Name too long')
  }

  if (description && description.length > MAX_DESC) {
    toast.warning(`Description must be ≤ ${MAX_DESC} characters`)
    throw new Error('Description too long')
  }

  if (!portalId) {
    toast.error('Portal ID is missing')
    throw new Error('Missing portal ID')
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
    toast.error(`Template does not support ${language}`)
    throw new Error(`Unsupported language: ${language}`)
  }

  if (!configYaml) {
    toast.error(`Template is missing config for ${language}`)
    throw new Error(`Missing config for ${language}`)
  }

  if (!template.event_json) {
    toast.error('Template is missing event.json')
    throw new Error('Missing event.json')
  }

  /* -------------------------------------
     Parse config.yaml safely
  ------------------------------------- */

  let parsedConfig
  try {
    parsedConfig = YAML.parse(configYaml)
  } catch {
    toast.error('Template config.yaml is invalid')
    throw new Error('Invalid config.yaml')
  }

  /* -------------------------------------
     Create action (Promise Toast)
  ------------------------------------- */

  return toast.promise(
    (async () => {

      const { data: action, error } = await supabase
        .from('actions')
        .insert({
          owner_id: ownerId,
          portal_id: portalId,
          name,
          description,
          language,
          filepath: '',
          config: parsedConfig,
          template_id: template.id ?? null,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to create action')
      }

      const basePath = `${portalId}/${action.id}`

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

        if (uploadError) {
          throw new Error(`Failed to upload ${path}`)
        }
      }

      window.dispatchEvent(new Event('actions:resync'))

      return action
    })(),
    {
      loading: 'Creating action from template…',
      success: (action) =>
        `Action "${action.name}" created successfully`,
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Failed to create action from template',
    }
  )
}
