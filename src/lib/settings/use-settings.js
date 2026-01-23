'use client'

import { useCallback, useEffect, useState } from 'react'
import { loadSettings, saveSettings } from './store'
import { EDITOR_SETTINGS } from './registry'

function getDefaults() {
  const defaults = {}

  Object.values(EDITOR_SETTINGS).forEach((group) => {
    Object.values(group).forEach((setting) => {
      defaults[setting.key] = setting.default
    })
  })

  return defaults
}

/* Used BEFORE Monaco mounts */
export function getCachedEditorTheme() {
  if (typeof window === 'undefined') return null

  try {
    const settings = loadSettings()
    return settings?.['editor.theme'] ?? null
  } catch {
    return null
  }
}
