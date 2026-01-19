'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

export function MonacoEditor({
  value,
  language,
  onChange,
  onMount,
}) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const viewStateRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(() => {
      editorRef.current?.layout()
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        value={value}
        language={language}
        theme="vs-dark"
        onMount={(editor, monaco) => {
          editorRef.current = editor
          onMount?.(editor)

          // Restore cursor + scroll position
          if (viewStateRef.current) {
            editor.restoreViewState(viewStateRef.current)
            editor.focus()
          }

          // Better JS defaults
          if (language === 'javascript') {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
              allowNonTsExtensions: true,
              target: monaco.languages.typescript.ScriptTarget.ES2020,
            })
          }

          // Save shortcut
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () => editor.getAction('editor.action.formatDocument')?.run()
          )

          // Run shortcut
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => document.dispatchEvent(new CustomEvent('editor:run'))
          )

          // Word wrap toggle
          editor.addCommand(
            monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
            () => {
              const current = editor.getOption(
                monaco.editor.EditorOption.wordWrap
              )
              editor.updateOptions({
                wordWrap: current === 'on' ? 'off' : 'on',
              })
            }
          )
        }}
        onChange={(v) => onChange?.(v ?? '')}
        onBlur={() => {
          viewStateRef.current = editorRef.current?.saveViewState()
        }}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,

          // UX
          smoothScrolling: true,
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',

          // Editing
          wordWrap: 'on',
          wrappingIndent: 'indent',
          tabSize: 2,
          insertSpaces: true,

          // Structure
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          matchBrackets: 'always',
          bracketPairColorization: { enabled: true },

          // Formatting
          formatOnPaste: true,
          formatOnType: true,

          // Discoverability
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  )
}
