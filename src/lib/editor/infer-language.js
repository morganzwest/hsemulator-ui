// /lib/editor/infer-language.js

export function inferLanguage(filename = '') {
  const name = String(filename).toLowerCase().trim();

  if (name.endsWith('.js') || name.endsWith('.mjs') || name.endsWith('.cjs')) {
    return 'javascript';
  }

  if (name.endsWith('.py')) {
    return 'python';
  }

  if (name.endsWith('.yaml') || name.endsWith('.yml')) {
    return 'yaml';
  }

  if (name.endsWith('.json')) {
    return 'json';
  }

  if (name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'markdown';
  }

  if (name.endsWith('.txt') || name.endsWith('.log')) {
    return 'plaintext';
  }

  // Fallback for unknown extensions
  return 'plaintext';
}
