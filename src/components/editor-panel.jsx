'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonacoEditor } from '@/components/monaco-editor';
import { Play, Save, Trash2, Columns, Rows } from 'lucide-react';
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5';
import { SiYaml } from 'react-icons/si';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/* -----------------------------
   File setup
----------------------------- */

const INITIAL_FILES = {
  'action.py': {
    language: 'python',
    value: `def main(event):\n    return {"ok": True}`,
    dirty: false,
  },
  'action.js': {
    language: 'javascript',
    value: `exports.main = async (event) => {\n  return { ok: true }\n}`,
    dirty: false,
  },
  'config.yaml': {
    language: 'yaml',
    value: `runtime: python\nversion: 3.11`,
    dirty: false,
  },
};

function LanguageIcon({ language }) {
  if (language === 'javascript') {
    return <IoLogoJavascript className='h-4 w-4 text-yellow-400' />;
  }
  if (language === 'python') {
    return <IoLogoPython className='h-4 w-4 text-blue-400' />;
  }
  return <SiYaml className='h-4 w-4 text-orange-400' />;
}

/* -----------------------------
   Resize handle
----------------------------- */

function ResizeHandle({ direction, onResize }) {
  const dragging = useRef(false);

  function start(e) {
    e.preventDefault();
    dragging.current = true;
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', stop);
  }

  function move(e) {
    if (!dragging.current) return;
    onResize(e);
  }

  function stop() {
    dragging.current = false;
    document.removeEventListener('mousemove', move);
    document.removeEventListener('mouseup', stop);
  }

  return (
    <div
      onMouseDown={start}
      className={`
        z-10 bg-border
        ${
          direction === 'horizontal'
            ? 'h-1 cursor-row-resize'
            : 'w-1 cursor-col-resize'
        }
        hover:bg-primary/60
      `}
    />
  );
}

/* -----------------------------
   Editor Panel
----------------------------- */

export function EditorPanel({ runtimeHealthy}) {
  const editorRef = useRef(null)
  const outputEndRef = useRef(null)
  const containerRef = useRef(null)

  const [files, setFiles] = useState(INITIAL_FILES)
  const [activeFile, setActiveFile] = useState('action.py')
  const [running, setRunning] = useState(false)
  const [logs, setLogs] = useState([])

  const [split, setSplit] = useState('horizontal')
  const [splitSize, setSplitSize] = useState(70)

  const active = files[activeFile]

  const isDirty = active.dirty
  const canRun = isDirty && runtimeHealthy && !running


  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  function updateFile(value) {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], value, dirty: true },
    }));
  }

  function handleSave() {
    editorRef.current?.getAction('editor.action.formatDocument')?.run();
    setFiles((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], dirty: false },
    }));
  }

  async function handleRun() {
    if (!active.dirty || running) return;

    setRunning(true);
    setLogs((l) => [...l, `▶ Running ${activeFile}`]);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: activeFile,
          source: active.value,
        }),
      });

      setLogs((l) => [...l, '✔ Execution completed']);
      handleSave();
    } catch {
      setLogs((l) => [...l, '✖ Execution failed']);
    } finally {
      setRunning(false);
    }
  }

  function handleResize(e) {
    const rect = containerRef.current.getBoundingClientRect();

    if (split === 'horizontal') {
      const y = e.clientY - rect.top;
      setSplitSize(Math.min(85, Math.max(15, (y / rect.height) * 100)));
    } else {
      const x = e.clientX - rect.left;
      setSplitSize(Math.min(85, Math.max(15, (x / rect.width) * 100)));
    }
  }

  const gridStyle =
    split === 'horizontal'
      ? {
          gridTemplateRows: `${splitSize}% 4px 1fr`,
        }
      : {
          gridTemplateColumns: `${splitSize}% 4px 1fr`,
        };

  return (
    <div className='flex h-full min-w-0 flex-col gap-3'>
      {/* Toolbar */}
      <div className='flex items-center justify-between border-b pb-2'>
        <Tabs value={activeFile} onValueChange={setActiveFile}>
          <TabsList>
            {Object.entries(files).map(([file, meta]) => (
              <TabsTrigger key={file} value={file}>
                <div className='flex items-center gap-2'>
                  <LanguageIcon language={meta.language} />
                  <span>{file}</span>
                  {meta.dirty && <span className='text-primary'>●</span>}
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() =>
              setSplit(split === 'horizontal' ? 'vertical' : 'horizontal')
            }
            title='Toggle split direction'
          >
            {split === 'horizontal' ? (
              <Columns className='h-4 w-4' />
            ) : (
              <Rows className='h-4 w-4' />
            )}
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={handleSave}
            disabled={!active.dirty}
          >
            <Save className='mr-1 h-4 w-4' />
            Save
          </Button>

          <Tooltip>
  <TooltipTrigger asChild>
    <Button
      size="sm"
      onClick={handleRun}
      disabled={!canRun}
      className={!canRun ? 'opacity-50' : ''}
    >
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
        : !isDirty
        ? 'No changes since last run'
        : 'Action is currently running'}
    </TooltipContent>
  )}
</Tooltip>

        </div>
      </div>

      {/* Split View */}
      <div
        ref={containerRef}
        className='grid flex-1 min-w-0 overflow-hidden rounded-md border bg-background'
        style={gridStyle}
      >
        {/* Editor */}
        <div className='min-w-0 -mb-1 overflow-hidden'>
          <MonacoEditor
            value={active.value}
            language={active.language}
            onChange={updateFile}
            onMount={(editor) => (editorRef.current = editor)}
          />
        </div>

        <ResizeHandle direction={split} onResize={handleResize} />

        {/* Output */}
        <div className='flex min-w-0 - flex-col bg-muted/30'>
          <div className='flex items-center justify-between border-b px-3 py-1 text-xs text-muted-foreground'>
            <span>Output</span>
            <Button variant='ghost' size='icon' onClick={() => setLogs([])}>
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>

          <div className='flex-1 overflow-auto px-3 py-2 font-mono text-xs'>
            {logs.length === 0 ? (
              <div className='text-muted-foreground'>No output yet</div>
            ) : (
              logs.map((line, i) => <div key={i}>{line}</div>)
            )}
            <div ref={outputEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
