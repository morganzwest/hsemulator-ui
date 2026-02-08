import { toast } from 'sonner'
import { getActivePortalId } from '@/lib/portal-state'
import { createPostCreateTour } from '../tours/postCreateTour'

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

export async function createAction({
  supabase,
  ownerId,
  name,
  description,
  language,
}) {
  /* -------------------------------
     Validation (Warnings / Errors)
  -------------------------------- */

  let portalId
  try {
    portalId = getActivePortalId()
  } catch {
    toast.error('No active workspace selected')
    throw new Error('Missing active portal')
  }

  if (!name) {
    toast.warning('Action name is required')
    throw new Error('Invalid name')
  }

  if (name.length > MAX_NAME) {
    toast.warning(`Action name must be ≤ ${MAX_NAME} characters`)
    throw new Error('Invalid name length')
  }

  if (description && description.length > MAX_DESC) {
    toast.warning(`Description must be ≤ ${MAX_DESC} characters`)
    throw new Error('Invalid description length')
  }

  /* -------------------------------
     Initial source files (NO CONFIG)
  -------------------------------- */

  const files = {
    'event.json': JSON.stringify(DEFAULT_EVENT, null, 2),
    [language === 'javascript' ? 'action.js' : 'action.py']:
      language === 'javascript'
        ? `exports.main = async (event) => {\n  return { ok: true }\n}\n`
        : `def main(event):\n    return {"ok": True}\n`,
  }

  function contentTypeFor(path) {
    if (path.endsWith('.json')) return 'application/json'
    return 'text/plain'
  }

  /* -------------------------------
     Promise Toast (Main Flow)
  -------------------------------- */

  return toast.promise(
    (async () => {
      toast.info('Creating action record')

      const { data: action, error } = await supabase
        .from('actions')
        .insert({
          owner_id: ownerId,
          portal_id: portalId,
          name,
          description,
          language,
          filepath: '', // resolved dynamically at runtime
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message || 'Failed to create action')
      }

      const basePath = `${portalId}/${action.id}`

      try {
        for (const [path, contents] of Object.entries(files)) {
          const { error } = await supabase.storage
            .from('actions')
            .upload(`${basePath}/${path}`, contents, {
              contentType: contentTypeFor(path),
              upsert: false,
            })

          if (error) throw error
        }
      } catch (err) {
        // Hard rollback if file upload fails
        await supabase.from('actions').delete().eq('id', action.id)
        throw err
      }

      window.dispatchEvent(new Event('actions:resync'))

      // Start the tour
      try {
        if (!localStorage.getItem('post_create_tour_seen')) {
          setTimeout(() => {
            if (window.__activeTour) return

            const tour = createPostCreateTour()

            window.__activeTour = tour

            const waitForEditor = setInterval(() => {
              if (document.querySelector('#editor-panel')) {
                tour.drive();
                clearInterval(waitForEditor);

                localStorage.removeItem('action_created');
              }
            }, 120);
          }, 1500)
        }
      } catch { }

      return action

    })(),
    {
      loading: 'Creating action…',
      success: (action) => `Action "${action.name}" created successfully`,
      error: (err) =>
        err instanceof Error
          ? err.message
          : 'Something went wrong while creating the action',
    }
  )
}
