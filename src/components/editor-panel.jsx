'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { TbJson } from 'react-icons/tb';
import { FaRegFile } from 'react-icons/fa';

/* -----------------------------
   Helpers
----------------------------- */

function inferLanguage(filename) {
  if (filename.endsWith('.js')) return 'javascript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.yaml') || filename.endsWith('.yml')) return 'yaml';
  if (filename.endsWith('.json')) return 'json';
  return 'plaintext';
}

function LanguageIcon({ language }) {
  switch (language) {
    case 'javascript':
    case 'js':
      return <IoLogoJavascript className='h-4 w-4 text-yellow-400' />;

    case 'python':
    case 'py':
      return <IoLogoPython className='h-4 w-4 text-blue-400' />;

    case 'yaml':
    case 'yml':
      return <SiYaml className='h-4 w-4 text-orange-400' />;

    case 'json':
      return <TbJson className='h-4 w-4 text-emerald-400' />;

    default:
      return <FaRegFile className='h-4 w-4 text-muted-foreground' />;
  }
}

/* -----------------------------
   Editor Panel
----------------------------- */

export function EditorPanel({ runtimeHealthy, activeAction }) {
  const supabase = createSupabaseBrowserClient();

  const editorRef = useRef(null);
  const outputEndRef = useRef(null);
  const containerRef = useRef(null);

  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);

  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);

  const [split, setSplit] = useState('horizontal');
  const [splitSize, setSplitSize] = useState(70);

  const active = activeFile ? files[activeFile] : null;
  const hasDirtyFiles = Object.values(files).some((f) => f.dirty);
  const canRun = runtimeHealthy && !running;

  /* -----------------------------
     Render visibility
  ----------------------------- */

  console.debug('[EditorPanel] render', {
    runtimeHealthy,
    hasActiveAction: Boolean(activeAction),
    activeFile,
    fileCount: Object.keys(files).length,
  });

  /* -----------------------------
     Load files when action changes
  ----------------------------- */

  useEffect(() => {
    console.group('[EditorPanel] loadFiles');

    if (!activeAction) {
      console.warn('[EditorPanel] No activeAction — clearing state');
      setFiles({});
      setActiveFile(null);
      console.groupEnd();
      return;
    }

    const { id, owner_id } = activeAction;
    const bucket = 'actions';
    const prefix = `${owner_id}/${id}/`;

    console.log('Action:', { id, owner_id });
    console.log('Bucket:', bucket);
    console.log('Prefix:', prefix);

    async function loadFiles() {
      setLoadingFiles(true);
      setLogs([]);

      // path = bucket/owner_id/action_id/
      const actionPath = `${owner_id}/${id}`;

      const { data: objects, error } = await supabase.storage
        .from('actions')
        .list(actionPath);

      console.log('[EditorPanel] list()', objects);

      console.log('Storage list:', { objects, error });

      if (error) {
        console.error('[EditorPanel] Storage list failed:', error);
        setLoadingFiles(false);
        console.groupEnd();
        return;
      }

      console.log('Total objects returned:', objects.length);

      const loadedFiles = {};

      for (const obj of objects ?? []) {
        const fullPath = `${actionPath}/${obj.name}`;

        console.log('[EditorPanel] Downloading:', fullPath);

        const { data, error } = await supabase.storage
          .from('actions')
          .download(fullPath);

        if (error) {
          console.error('Download failed:', fullPath, error);
          continue;
        }

        loadedFiles[obj.name] = {
          language: inferLanguage(obj.name),
          value: await data.text(),
          dirty: false,
        };
      }

      const filenames = Object.keys(loadedFiles);
      const firstFile = filenames[0] ?? null;

      console.log('Loaded files:', filenames);
      console.log('Initial activeFile:', firstFile);

      setFiles(loadedFiles);
      setActiveFile(firstFile);
      setLoadingFiles(false);
      console.groupEnd();
    }

    loadFiles();
  }, [activeAction, supabase]);

  /* -----------------------------
     Output scroll
  ----------------------------- */

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  /* -----------------------------
     Editor actions
  ----------------------------- */

  function updateFile(value) {
    console.debug('[EditorPanel] updateFile', { activeFile });
    setFiles((prev) => ({
      ...prev,
      [activeFile]: { ...prev[activeFile], value, dirty: true },
    }));
  }

  async function handleSave() {
  if (!activeAction) return;

  const { id, owner_id } = activeAction;
  const basePath = `${owner_id}/${id}`;

  console.debug('[EditorPanel] Saving all files');

  // Format active editor only (Monaco limitation)
  editorRef.current
    ?.getAction('editor.action.formatDocument')
    ?.run();

  // Upload all dirty files
  const uploads = Object.entries(files).map(async ([filename, file]) => {
    if (!file.dirty) return;

    const path = `${basePath}/${filename}`;

    const { error } = await supabase.storage
      .from('actions')
      .upload(path, new Blob([file.value]), {
        upsert: true,
        contentType: 'text/plain',
      });

    if (error) {
      console.error('Save failed:', filename, error);
      throw error;
    }
  });

  await Promise.all(uploads);

  // 🔁 Touch the action row so updated_at is refreshed
  const { error: updateError } = await supabase
    .from('actions')
    .update({}) // empty update — trigger handles updated_at
    .eq('id', id);

  if (updateError) {
    console.error('[EditorPanel] Failed to update action timestamp', updateError);
    throw updateError;
  }

  // Clear dirty flags
  setFiles((prev) =>
    Object.fromEntries(
      Object.entries(prev).map(([name, file]) => [
        name,
        { ...file, dirty: false },
      ])
    )
  );

  console.debug('[EditorPanel] Save complete');
}



  async function handleRun() {
    if (!canRun) {
      console.warn('[EditorPanel] Run blocked', {
        dirty: isDirty,
        runtimeHealthy,
        running,
      });
      return;
    }

    console.log('[EditorPanel] Running:', activeFile);
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

      console.log('[EditorPanel] Run completed');
      setLogs((l) => [...l, '✔ Execution completed']);
      handleSave();
    } catch (err) {
      console.error('[EditorPanel] Run failed:', err);
      setLogs((l) => [...l, '✖ Execution failed']);
    } finally {
      setRunning(false);
    }
  }

  /* -----------------------------
     Empty states
  ----------------------------- */

  if (!activeAction) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
        Select an action to view its files
      </div>
    );
  }

  if (loadingFiles) {
    return (
      <div className='flex h-full items-center justify-center gap-2 text-sm text-muted-foreground'>
        <Spinner /> Loading files…
      </div>
    );
  }

  if (!active) {
    return (
      <div className='flex h-full items-center justify-center text-sm text-muted-foreground'>
        No files found for this action
      </div>
    );
  }

  const gridStyle =
    split === 'horizontal'
      ? { gridTemplateRows: `${splitSize}% 4px 1fr` }
      : { gridTemplateColumns: `${splitSize}% 4px 1fr` };

  function handleResize(e) {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();

    let percentage;

    if (split === 'horizontal') {
      const offsetY = e.clientY - rect.top;
      percentage = (offsetY / rect.height) * 100;
    } else {
      const offsetX = e.clientX - rect.left;
      percentage = (offsetX / rect.width) * 100;
    }

    // Clamp to sensible bounds
    percentage = Math.min(90, Math.max(10, percentage));

    setSplitSize(percentage);
  }

  /* -----------------------------
     Render
  ----------------------------- */
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
            disabled={!hasDirtyFiles}
          >
            <Save className='mr-1 h-4 w-4' />
            Save
          </Button>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size='sm' onClick={handleRun} disabled={!canRun}>
                {running ? (
                  <Spinner className='mr-2' />
                ) : (
                  <Play className='mr-1 h-4 w-4' />
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

      {/* Split View */}
      <div
        ref={containerRef}
        className='grid flex-1 min-w-0 overflow-hidden rounded-md border bg-background'
        style={gridStyle}
      >
        <div className='min-w-0 -mb-1 overflow-hidden'>
          <MonacoEditor
            value={active.value}
            language={active.language}
            onChange={updateFile}
            onMount={(editor) => (editorRef.current = editor)}
          />
        </div>

        <div
          onMouseDown={(e) => {
            e.preventDefault();

            const onMouseUp = () => {
              document.removeEventListener('mousemove', handleResize);
              document.removeEventListener('mouseup', onMouseUp);
            };

            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', onMouseUp);
          }}
          className={`z-10 bg-border ${
            split === 'horizontal'
              ? 'h-1 cursor-row-resize'
              : 'w-1 cursor-col-resize'
          }`}
        />

        <div className='flex min-w-0 flex-col bg-muted/30'>
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
