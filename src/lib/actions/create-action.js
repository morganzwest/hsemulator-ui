import YAML from 'yaml'

const MAX_NAME = 32
const MAX_DESC = 64

const DEFAULT_EVENT = {
  object: {
    objectType: 'CONTACT',
    objectId: 123456,
  },
  inputFields: {},
  fields: {},
  portalId: 12345678,
}

function buildConfig(language) {
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

export async function createAction({
  supabase,
  ownerId,
  portalId,
  name,
  description,
  language,
}) {
  if (!name || name.length > MAX_NAME) {
    throw new Error('Invalid name')
  }

  if (description && description.length > MAX_DESC) {
    throw new Error('Invalid description')
  }

  const config = buildConfig(language)
  const configYaml = YAML.stringify(config)

  const files = {
    'config.yaml': configYaml,
    'event.json': JSON.stringify(DEFAULT_EVENT, null, 2),
    [language === 'javascript' ? 'action.js' : 'action.py']:
      language === 'javascript'
        ? `exports.main = async (event) => {\n  return { ok: true }\n}`
        : `def main(event):\n    return {"ok": True}\n`,
  }

  const { data: action, error } = await supabase
    .from('actions')
    .insert({
      owner_id: ownerId,
      portal_id: portalId,
      name,
      description,
      language,
      filepath: '',
      config,
    })
    .select()
    .single()

  if (error) throw error

  const basePath = `${ownerId}/${action.id}`

  for (const [path, contents] of Object.entries(files)) {
    const { error: uploadError } = await supabase.storage
      .from('actions')
      .upload(`${basePath}/${path}`, contents, {
        contentType: 'text/plain',
        upsert: false,
      })

    if (uploadError) throw uploadError
  }

  return action
}
