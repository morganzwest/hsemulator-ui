// src/lib/editor/register-themes.js
// Client-side only – call from Monaco onMount
import { getCachedEditorTheme } from '@/lib/settings/use-settings'

const loadedThemes = new Set()
let registrationPromise = null

const THEME_OPTIONS = {
  validate: true,
}

export function configureMonacoThemes(options = {}) {
  Object.assign(THEME_OPTIONS, options)
  console.log('[monaco-themes] Config updated:', THEME_OPTIONS)
}

/* -------------------------------------
   Internal helpers
------------------------------------- */

function log(...args) {
  console.log('[monaco-themes]', ...args)
}

/**
 * Load a Monaco theme JSON from /public/themes and register it
 */
async function loadTheme(monaco, themeName) {
  if (loadedThemes.has(themeName)) {
    log('Theme already loaded:', themeName)
    return
  }

  log('Loading theme:', themeName)

  const res = await fetch(`/themes/${themeName}.json`)
  if (!res.ok) {
    if (THEME_OPTIONS.validate) {
      console.error('[monaco-themes] Theme file missing:', themeName)
    } else {
      log('Skipping missing theme:', themeName)
    }
    return
  }

  const themeData = await res.json()
  monaco.editor.defineTheme(themeName, themeData)

  loadedThemes.add(themeName)
}

/* -------------------------------------
   Public API
------------------------------------- */

export async function registerMonacoThemes(monaco) {
  if (typeof window === 'undefined') return
  if (registrationPromise) return registrationPromise

  registrationPromise = (async () => {
    const themes = [
      'monokai',
      'dracula',
      'solarized-dark',
      'night-owl',
      'oceanic-next',
      'amy',
      'cobalt2',
      'monoindustrial',
      'merbivore',
      'merbivore-soft',
      'github-dark',
      'github',
    ]

    log('Registering themes:', themes)

    for (const theme of themes) {
      await loadTheme(monaco, theme)
    }

    log('Theme registration complete')
  })()

  return registrationPromise
}

export async function bootstrapMonacoTheme(monaco) {
  const theme = getCachedEditorTheme()
  log('Bootstrapping cached theme:', theme)

  if (!theme) return

  await registerMonacoThemes(monaco)
  await loadTheme(monaco, theme)

  monaco.editor.setTheme(theme)
}


export async function setMonacoTheme(monaco, themeName) {
  if (!themeName) return

  log('Theme switch requested:', themeName)

  await registerMonacoThemes(monaco)
  await loadTheme(monaco, themeName)

  monaco.editor.setTheme(themeName)
}
