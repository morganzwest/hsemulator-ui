import YAML from 'yaml'
import slugify from 'slugify'

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
  if (!name || name.length > MAX_NAME) {
    throw new Error('Invalid template name')
  }

  if (description && description.length > MAX_DESC) {
    throw new Error('Invalid description')
  }

  if (!files || typeof files !== 'object') {
    throw new Error('Missing editor files')
  }

  /* -------------------------------------
     Extract editor sources ONLY
  ------------------------------------- */

  const jsAction = files['action.js']?.value ?? null
  const pyAction = files['action.py']?.value ?? null
  const eventJsonRaw = files['event.json']?.value

  if (!eventJsonRaw) {
    throw new Error('Missing event.json')
  }

  const languages = []
  if (jsAction) languages.push('javascript')
  if (pyAction) languages.push('python')

  if (languages.length === 0) {
    throw new Error('Template must contain at least one action')
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
     Insert template
  ------------------------------------- */

  const slug = slugify(name, { lower: true, strict: true })

  const { data: template, error } = await supabase
    .from('action_templates')
    .insert({
      name,
      description,
      slug,
      created_by: ownerId,
      visibility: 'private',
      languages,
      js_action: jsAction,
      py_action: pyAction,
      event_json: JSON.parse(eventJsonRaw),
      config_yaml_js: configYamlJs,
      config_yaml_py: configYamlPy,
      version: 1,
    })
    .select()
    .single()

  if (error) throw error

  return template
}
