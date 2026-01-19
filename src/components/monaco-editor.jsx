'use client'

import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'

export function MonacoEditor({ value, language, onChange, onMount }) {
  const containerRef = useRef(null)
  const editorRef = useRef(null)

  const layout = () => {
    if (editorRef.current) editorRef.current.layout()
  }

  useEffect(() => {
    if (!containerRef.current) return

    // 1) Observe container changes
    const ro = new ResizeObserver(() => layout())
    ro.observe(containerRef.current)

    // 2) Also respond to window resizes (sidebar toggles can behave like this)
    window.addEventListener('resize', layout)

    // 3) Force a layout after first paint (important for collapsible sidebars)
    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(() => layout())
      // nested raf gives layout a beat to settle
      ;(layout._raf2 = raf2)
    })

    return () => {
      ro.disconnect()
      window.removeEventListener('resize', layout)
      cancelAnimationFrame(raf1)
      if (layout._raf2) cancelAnimationFrame(layout._raf2)
    }
  }, [])

  return (
    <div ref={containerRef} className="h-full w-full min-w-0 overflow-hidden">
      <Editor
        height="100%"
        value={value}
        language={language}
        theme="vs-dark"
        onMount={(editor) => {
          editorRef.current = editor
          onMount?.(editor)
          layout()
        }}
        onChange={(v) => onChange?.(v ?? '')}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          // this can help with some flex layouts
          automaticLayout: false,
        }}
      />
    </div>
  )
}
