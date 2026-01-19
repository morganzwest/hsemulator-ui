'use client'

import Editor from '@monaco-editor/react'

// if code length is > 80 lines, show minimap
function shouldShowMinimap(value) {
  const lineCount = value.split('\n').length
  return lineCount > 80
}

export function MonacoEditor({ value, language, onChange, onMount }) {
  return (
    <div className="h-full w-full rounded-md border bg-background">
      <Editor
        height="100%"
        value={value}
        language={language}
        theme="vs-dark"
        onMount={onMount}
        onChange={(v) => onChange(v ?? '')}
        options={{
          fontSize: 14,
          minimap: { enabled: shouldShowMinimap(value) },
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  )
}
