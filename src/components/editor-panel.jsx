'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonacoEditor } from '@/components/monaco-editor';

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
};

function RuntimeStatus({ healthy, checking }) {
  let color = 'bg-muted';
  let label = 'Checking runtime';

  if (!checking) {
    if (healthy) {
      color = 'bg-emerald-500';
      label = 'Runtime Ready';
    } else {
      color = 'bg-red-500';
      label = 'Runtime offline';
    }
  }

  return (
    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
      <span className={`h-2 w-2 rounded-full ${color}`} title={label} />
      <span>{label}</span>
    </div>
  );
}

export function EditorPanel() {
  const editorRef = useRef(null);

  const [files, setFiles] = useState(INITIAL_FILES);
  const [activeFile, setActiveFile] = useState('action.py');

  const [healthy, setHealthy] = useState(false);
  const [checkingHealth, setCheckingHealth] = useState(true);
  const [loading, setLoading] = useState(false);

  // Health check
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_RUNTIME_URL}/health`,
        );
        setHealthy(res.ok);
      } catch {
        setHealthy(false);
      } finally {
        setCheckingHealth(false);
      }
    }

    checkHealth();
  }, []);

  function updateFile(value) {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        value,
      },
    }));
  }

  async function handleRun() {
    if (!healthy) return;

    const file = files[activeFile];

    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_URL}/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: activeFile,
          source: file.value,
        }),
      });
    } finally {
      setLoading(false);
    }
  }

  const runDisabled = !healthy || checkingHealth || loading;

  return (
    <div className='flex h-full flex-col gap-3'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <Tabs value={activeFile} onValueChange={setActiveFile}>
            <TabsList>
              {Object.keys(files).map((file) => (
                <TabsTrigger key={file} value={file}>
                  {file}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className='flex items-center gap-3'>
          <Button variant='outline' size='sm'>
            Save
          </Button>

          <Button size='sm' onClick={handleRun} disabled={runDisabled}>
            {(loading || checkingHealth) && <Spinner className='mr-2' />}
            Run
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className='flex-1 overflow-hidden min-w-0 rounded-md border bg-background'>
        <MonacoEditor
          value={files[activeFile].value}
          language={files[activeFile].language}
          onChange={updateFile}
          onMount={(editor) => (editorRef.current = editor)}
        />
      </div>
    </div>
  );
}
