'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MonacoEditor } from '@/components/monaco-editor'
import { Play, Save, Columns, Rows, Trash2 } from 'lucide-react'
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5'
import { SiYaml } from 'react-icons/si'
import { TbJson } from 'react-icons/tb'
import { FaRegFile } from 'react-icons/fa'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { useActionEditor } from '@/lib/editor/use-action-editor'

/* -----------------------------
   Language icon
----------------------------- */

function LanguageIcon({ language }) {
  switch (language) {
    case 'javascript':
    case 'js':
      return <IoLogoJavascript className="h-4 w-4 text-yellow-400" />
    case 'python':
    case 'py':
      return <IoLogoPython className="h-4 w-4 text-blue-400" />
    case 'yaml':
    case 'yml':
      return <SiYaml className="h-4 w-4 text-orange-400" />
    case 'json':
      return <TbJson className="h-4 w-4 text-emerald-400" />
    default:
      return <FaRegFile className="h-4 w-4 text-muted-foreground" />
  }
}

/* -----------------------------
   Editor Panel
----------------------------- */

export function EditorPanel({ runtimeHealthy, activeAction }) {
  const editorRef = useRef(null)
  const outputEndRef = useRef(null)
  const containerRef = useRef(null)

  const [files, setFiles] = useState({})
  const [activeFile, setActiveFile] = useState(null)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])

  const [split, setSplit] = useState('verticalS')
  const [splitSize, setSplitSize] = useState(60)

  const active = activeFile ? files[activeFile] : null
  const hasDirtyFiles = Object.values(files).some(f => f.dirty)
  const canRun = runtimeHealthy && !running

  const { loadFiles, saveAllFiles, runFile } = useActionEditor({
    activeAction,
    files,
    setFiles,
    setActiveFile,
    setLoadingFiles,
    setLogs,
    setRunning,
  })

  useEffect(() => {
    if (!activeAction) {
      setFiles({})
      setActiveFile(null)
      return
    }
    loadFiles()
  }, [activeAction])

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  function updateFile(value) {
    setFiles(prev => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        value,
        dirty: true,
      },
    }))
  }

  async function handleSave() {
    await saveAllFiles(editorRef)
  }

  async function handleRun() {
    if (!canRun) return
    await saveAllFiles(editorRef)
    await runFile()
  }

  function handleResize(e) {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const percentage =
      split === 'horizontal'
        ? ((e.clientY - rect.top) / rect.height) * 100
        : ((e.clientX - rect.left) / rect.width) * 100
    setSplitSize(Math.min(90, Math.max(10, percentage)))
  }

  const gridStyle =
    split === 'horizontal'
      ? { gridTemplateRows: `${splitSize}% 4px 1fr` }
      : { gridTemplateColumns: `${splitSize}% 4px 1fr` }

  if (!activeAction) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Select an action to view its files
      </div>
    )
  }

  if (loadingFiles) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner /> Loading files…
      </div>
    )
  }

  if (!active) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        No files found for this action
      </div>
    )
  }

  return (
    <div className="flex h-[93vh] min-w-0 flex-col gap-3 overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b pb-2">
        <Tabs value={activeFile} onValueChange={setActiveFile}>
          <TabsList>
            {Object.entries(files).map(([file, meta]) => (
              <TabsTrigger key={file} value={file}>
                <div className="flex items-center gap-2">
                  <LanguageIcon language={meta.language} />
                  <span>{file}</span>
                  {meta.dirty && <span className="text-primary">●</span>}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              setSplit(split === 'horizontal' ? 'vertical' : 'horizontal')
            }
          >
            {split === 'horizontal' ? <Columns /> : <Rows />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={!hasDirtyFiles}
          >
            <Save className="mr-1 h-4 w-4" />
            Save
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" onClick={handleRun} disabled={!canRun}>
                {running ? (
                  <Spinner className="mr-2" />
                ) : (
                  <Play className="mr-1 h-4 w-4" />
                )}
                Run
              </Button>
            </TooltipTrigger>
            {!canRun && (
              <TooltipContent>
                {!runtimeHealthy
                  ? 'Runtime is offline'
                  : running
                  ? 'Action is currently running'
                  : 'Unable to run'}
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </div>

      {/* Split view */}
      <div
        ref={containerRef}
        className="grid flex-1 min-w-0 overflow-hidden rounded-md border bg-background"
        style={gridStyle}
      >
        <MonacoEditor
          value={active.value}
          language={active.language}
          onChange={updateFile}
          onMount={editor => (editorRef.current = editor)}
        />

        <div
          onMouseDown={e => {
            e.preventDefault()
            const up = () => {
              document.removeEventListener('mousemove', handleResize)
              document.removeEventListener('mouseup', up)
            }
            document.addEventListener('mousemove', handleResize)
            document.addEventListener('mouseup', up)
          }}
          className={`bg-border ${
            split === 'horizontal'
              ? 'h-1 cursor-row-resize'
              : 'w-1 cursor-col-resize'
          }`}
        />

        {/* Output */}
        <div className="relative flex min-w-0 flex-col bg-muted/30 max-h-full overflow-hidden">
          <div className="flex items-center justify-between border-b px-3 py-1 text-xs text-muted-foreground">
            <span>Output</span>
            <Button variant="ghost" size="icon" onClick={() => setLogs([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-auto px-3 py-2 font-mono text-xs whitespace-pre-wrap break-words">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No output yet</div>
            ) : (
              logs.map((line, i) => <div key={i}>{line}</div>)
            )}
            <div ref={outputEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}
