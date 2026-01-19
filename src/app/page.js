'use client'

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoEditor } from '@/components/monaco-editor'

const INITIAL_FILES = {
  'action.py': {
    language: 'python',
    value: `def main(event):\n    return {"ok": True}`,
  },
  'action.js': {
    language: 'javascript',
    value: `exports.main = async (event) => {\n  return { ok: true }\n}`,
  },
  'config.yaml': {
    language: 'yaml',
    value: `runtime: python\nversion: 3.11`,
  },
}

export default function HomePage() {
  const editorRef = useRef(null)

  const [files, setFiles] = useState(INITIAL_FILES)
  const [activeFile, setActiveFile] = useState('action.py')

  const [healthy, setHealthy] = useState(false)
  const [checkingHealth, setCheckingHealth] = useState(true)
  const [loading, setLoading] = useState(false)

  // Health check
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_RUNTIME_URL}/health`
        )
        setHealthy(res.ok)
      } catch {
        setHealthy(false)
      } finally {
        setCheckingHealth(false)
      }
    }

    checkHealth()
  }, [])

  function updateFile(value) {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        value,
      },
    }))
  }

  async function handleRun() {
    if (!healthy) return

    const file = files[activeFile]

    setLoading(true)

    try {
      await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: activeFile,
          source: file.value,
        }),
      })
    } finally {
      setLoading(false)
    }
  }

  const runDisabled = !healthy || checkingHealth || loading

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-5xl">
        <CardHeader>
          <CardTitle>Editor</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Tabs value={activeFile} onValueChange={setActiveFile}>
            <TabsList>
              {Object.keys(files).map((file) => (
                <TabsTrigger key={file} value={file}>
                  {file}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <MonacoEditor
            value={files[activeFile].value}
            language={files[activeFile].language}
            onChange={updateFile}
            onMount={(editor) => (editorRef.current = editor)}
          />

          <div className="flex justify-end gap-4">
            <Button variant="outline">Save</Button>

            <Button onClick={handleRun} disabled={runDisabled}>
              {(loading || checkingHealth) && (
                <Spinner className="mr-2" />
              )}
              Run
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
