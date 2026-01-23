'use client'

import { useEffect, useRef, useMemo } from 'react'
import Editor from '@monaco-editor/react'
import { useSettingsContext as useSettings } from '@/lib/settings/settings-provider'
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
     Remount key (ALL non-theme settings)
  ------------------------------------- */

  const editorKey = useMemo(() => {
    return [
      settings['editor.fontSize'],
      settings['editor.lineHeight'],
      settings['editor.minimap'],
      settings['editor.wordWrap'],
      settings['editor.smoothScrolling'],
      settings['editor.renderWhitespace'],
      settings['editor.bracketColorization'],
    ].join(':')
  }, [
    settings['editor.fontSize'],
    settings['editor.lineHeight'],
    settings['editor.minimap'],
    settings['editor.wordWrap'],
    settings['editor.smoothScrolling'],
    settings['editor.renderWhitespace'],
    settings['editor.bracketColorization'],
  ])

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
     Render
  ------------------------------------- */

  return (
    <div ref={containerRef} className="h-full w-full overflow-hidden">
      <Editor
        key={editorKey}
        height="100%"
        value={value}
        language={language}
        theme={undefined}

        onMount={async (editor, monaco) => {
          editorRef.current = editor
          monacoRef.current = monaco
          window.monaco = monaco

          /* Restore view state */
          if (viewStateRef.current) {
            editor.restoreViewState(viewStateRef.current)
            editor.focus()
          }

          /* Static + user preferences (construction-time only) */
          editor.updateOptions({
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

            fontSize: Number(settings['editor.fontSize']),
            lineHeight: Number(settings['editor.lineHeight']),
            minimap: {
              enabled: Boolean(settings['editor.minimap']),
            },
            wordWrap: settings['editor.wordWrap'] ? 'on' : 'off',
            smoothScrolling: Boolean(settings['editor.smoothScrolling']),
            renderWhitespace: settings['editor.renderWhitespace']
              ? 'all'
              : 'none',
            bracketPairColorization: {
              enabled: Boolean(settings['editor.bracketColorization']),
            },
          })

          /* Themes (no remount required) */
          await registerMonacoThemes(monaco)
          await bootstrapMonacoTheme(monaco)

          onMount?.(editor)

          /* Language-specific defaults */
          if (language === 'javascript') {
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
              allowNonTsExtensions: true,
              target: monaco.languages.typescript.ScriptTarget.ES2020,
            })
          }

          /* Shortcuts */
          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
            () =>
              editor
                .getAction('editor.action.formatDocument')
                ?.run(),
          )

          editor.addCommand(
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () =>
              document.dispatchEvent(
                new CustomEvent('editor:run'),
              ),
          )

          editor.addCommand(
            monaco.KeyMod.Alt | monaco.KeyCode.KeyZ,
            () => {
              const current = editor.getOption(
                monaco.editor.EditorOption.wordWrap,
              )

              editor.updateOptions({
                wordWrap: current === 'on' ? 'off' : 'on',
              })
            },
          )
        }}

        onChange={(v) => onChange?.(v ?? '')}

        onBlur={() => {
          if (editorRef.current) {
            viewStateRef.current =
              editorRef.current.saveViewState()
          }
        }}
      />
    </div>
  )
}
