export const EDITOR_SETTINGS = {
  appearance: {
    colorMode: {
      key: 'appearance.colorMode',
      label: 'Color mode',
      type: 'select',
      options: [
        { label: 'System', value: 'system' },
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
      ],
      default: 'system',
    },
  },

  editor: {
    fontSize: {
      key: 'editor.fontSize',
      label: 'Font size',
      type: 'number',
      min: 12,
      max: 22,
      step: 1,
      default: 14,
    },

    lineHeight: {
      key: 'editor.lineHeight',
      label: 'Line height',
      type: 'number',
      min: 18,
      max: 32,
      step: 2,
      default: 22,
    },

    theme: {
      key: 'editor.theme',
      label: 'Editor theme',
      type: 'select',
      options: [
        // Custom JSON themes (loaded from /public/themes)
        { label: 'Monokai', value: 'monokai' },
        { label: 'Solarized Dark', value: 'solarized-dark' },
        { label: 'Night Owl', value: 'night-owl' },
        { label: 'Oceanic Next', value: 'oceanic-next' },
        { label: 'Cobalt', value: 'cobalt2' },
        { label: 'Amy', value: 'amy' },

        // Built-in Monaco themes (NO JSON, NO fetch)
        { label: 'VS Code Dark', value: 'github-dark' },
        { label: 'VS Code Light', value: 'github' },
        { label: 'High Contrast Dark', value: 'hc-black' },
      ],
      default: 'github-dark',
    },

    validateThemes: {
      key: 'editor.validateThemes',
      label: 'Validate editor themes',
      description:
        'Warn when a selected theme is missing or invalid (recommended for development).',
      type: 'toggle',
      default: true,
    },
  },
}
