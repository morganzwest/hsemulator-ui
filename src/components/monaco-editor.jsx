'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useSettings } from '@/lib/settings/use-settings'
import {
  registerMonacoThemes,
  bootstrapMonacoTheme,
} from '@/lib/editor/register-themes'

export function MonacoEditor({
  value,
  language,
  onChange,
  onMount,
}) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)
  const monacoRef = useRef(null)
  const viewStateRef = useRef(null)

  const { settings } = useSettings()

  /* -------------------------------------
     Resize handling
  ------------------------------------- */

  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver(() => {
      editorRef.current?.layout()
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  /* -------------------------------------
     Apply editor options reactively
     (NOT theme)
  ------------------------------------- */

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return

    editorRef.current.updateOptions({
      fontSize: settings['editor.fontSize'],
      lineHeight: settings['editor.lineHeight'],
      fontFamily: settings['editor.fontFamily'],

      minimap: { enabled: settings['editor.minimap'] },
      wordWrap: settings['editor.wordWrap'] ? 'on' : 'off',
      smoothScrolling: settings['editor.smoothScrolling'],
      renderWhitespace: settings['editor.renderWhitespace']
        ? 'all'
        : 'none',
      bracketPairColorization: {
        enabled: settings['editor.bracketColorization'],
      },
    })
  }, [settings])

  /* -------------------------------------
     Render
  ------------------------------------- */

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Editor
        height="100%"
        value={value}
        language={language}

        /* 🔑 DO NOT set theme prop (prevents flash) */
        theme={undefined}

        onMount={async (editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco

          // Expose for settings page + commands
          window.monaco = monaco

          /* 1️⃣ Register all themes (once) */
          await registerMonacoThemes(monaco)

          /* 2️⃣ Apply cached theme BEFORE first paint */
          await bootstrapMonacoTheme(monaco)

          onMount?.(editor)

          /* Restore cursor + scroll position */
          if (viewStateRef.current) {
            editor.restoreViewState(viewStateRef.current)
            editor.focus()
          }

          /* Better JS defaults */
          if (language === 'javascript') {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
              allowNonTsExtensions: true,
              target: monaco.languages.typescript.ScriptTarget.ES2020,
            })
          }

          /* Save shortcut */
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () =>
              editor
                .getAction('editor.action.formatDocument')
                ?.run()
          )

          /* Run shortcut */
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () =>
              document.dispatchEvent(
                new CustomEvent('editor:run')
              )
          )

          /* Word wrap toggle */
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
          viewStateRef.current =
            editorRef.current?.saveViewState()
        }}

        options={{
          scrollBeyondLastLine: false,
          cursorSmoothCaretAnimation: 'on',
          renderLineHighlight: 'all',
          wrappingIndent: 'indent',
          tabSize: 2,
          insertSpaces: true,
          autoClosingBrackets: 'always',
          autoClosingQuotes: 'always',
          matchBrackets: 'always',
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
        }}
      />
    </div>
  )
}
