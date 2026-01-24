import YAML from 'yaml'
import slugify from 'slugify'
import { toast } from 'sonner'

const MAX_NAME = 64
const MAX_DESC = 256

/* -------------------------------------
   BASE CONFIG (AUTHORITATIVE)
------------------------------------- */

function buildBaseConfig(language) {
  return {
    version: 1,
    action: {
      type: language === 'javascript' ? 'js' : 'python',
      entry: language === 'javascript' ? 'action.js' : 'action.py',
    },
    fixtures: ['event.json'],
    env: {
      HUBSPOT_TOKEN: 'pat-your-token-here',
      HUBSPOT_BASE_URL: 'https://api.hubapi.com',
    },
    runtime: {
      node: 'node',
      python: 'python',
    },
    repeat: 1,
  }
}

/**
 * Create a PRIVATE template from editor code.
 *
 * - NEVER reads editor config.yaml
 * - ALWAYS uses BASE CONFIG
 */
export async function createPrivateTemplate({
  supabase,
  ownerId,
  name,
  description,
  files,
}) {
  /* -------------------------------------
     Validation (Warnings)
  ------------------------------------- */

  if (!name) {
    toast.warning('Template name is required')
    throw new Error('Missing template name')
  }

  if (name.length > MAX_NAME) {
    toast.warning(`Template name must be ≤ ${MAX_NAME} characters`)
    throw new Error('Template name too long')
  }

  if (description && description.length > MAX_DESC) {
    toast.warning(`Description must be ≤ ${MAX_DESC} characters`)
    throw new Error('Description too long')
  }

  if (!files || typeof files !== 'object') {
    toast.error('Editor files are missing or invalid')
    throw new Error('Missing editor files')
  }

  /* -------------------------------------
     Extract editor sources ONLY
  ------------------------------------- */

  const jsAction = files['action.js']?.value ?? null
  const pyAction = files['action.py']?.value ?? null
  const eventJsonRaw = files['event.json']?.value

  if (!eventJsonRaw) {
    toast.error('event.json is required to create a template')
    throw new Error('Missing event.json')
  }

  const languages = []
  if (jsAction) languages.push('javascript')
  if (pyAction) languages.push('python')

  if (languages.length === 0) {
    toast.warning('Template must include at least one action file')
    throw new Error('No action source provided')
  }

  /* -------------------------------------
     Parse event.json safely
  ------------------------------------- */

  let parsedEventJson
  try {
    parsedEventJson = JSON.parse(eventJsonRaw)
  } catch {
    toast.error('event.json contains invalid JSON')
    throw new Error('Invalid event.json')
  }

  /* -------------------------------------
     Build BASE configs (per language)
  ------------------------------------- */

  const configYamlJs = languages.includes('javascript')
    ? YAML.stringify(buildBaseConfig('javascript'))
    : null

  const configYamlPy = languages.includes('python')
    ? YAML.stringify(buildBaseConfig('python'))
    : null

  /* -------------------------------------
     Insert template (Promise Toast)
  ------------------------------------- */

  return toast.promise(
    (async () => {
      const slug = slugify(ownerId + '_' + name, { lower: true, strict: true })

      const { data: template, error } = await supabase
        .from('action_templates')
        .insert({
          name,
          description,
          slug,
          languages,
          visibility: 'private',
          js_action: jsAction,
          py_action: pyAction,
          event_json: parsedEventJson,
          config_yaml_js: configYamlJs,
          config_yaml_py: configYamlPy,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to create template')
      }

      return template
    })(),
    {
      loading: 'Creating private template…',
      success: (template) =>
        `Template "${template.name}" created successfully`,
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Failed to create template',
    }
  )
}
