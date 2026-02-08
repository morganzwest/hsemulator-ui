'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MonacoEditor } from '@/components/monaco-editor';
import {
  Play,
  Save,
  Star,
  Columns,
  Rows,
  Trash2,
  Workflow,
} from 'lucide-react';
import { IoLogoJavascript, IoLogoPython } from 'react-icons/io5';
import { SiYaml } from 'react-icons/si';
import { TbJson } from 'react-icons/tb';
import { FaRegFile } from 'react-icons/fa';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useActionEditor } from '@/lib/editor/use-action-editor';
import { createPrivateTemplate } from '@/lib/actions/create-private-template';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { IconFolderCode } from '@tabler/icons-react';
import { TemplatesSheet } from '~/components/template-sheet';
import { CreateActionDialog } from '@/components/create-action-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CICDSetupDrawer } from './cicdsetupdrawer';
import { AssignSecretsDialog } from './assign-secrets-dialog';
import { Key } from 'lucide-react';

/* --------------------------------
   Language icon
-------------------------------- */

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

/* --------------------------------
   Editor Panel
-------------------------------- */

export function EditorPanel({ runtimeHealthy, activeAction }) {
  const editorRef = useRef(null);
  const outputEndRef = useRef(null);
  const containerRef = useRef(null);

  const supabase = createSupabaseBrowserClient();

  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const [files, setFiles] = useState({});
  const [activeFile, setActiveFile] = useState(null);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [cicdOpen, setCicdOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [split, setSplit] = useState('vertical');
  const [splitSize, setSplitSize] = useState(60);

  const active = activeFile ? files[activeFile] : null;
  const hasDirtyFiles = Object.values(files).some((f) => f.dirty);
  const canRun = runtimeHealthy && !running;

  const { loadFiles, saveAllFiles, runFile } = useActionEditor({
    activeAction,
    files,
    setFiles,
    setActiveFile,
    setLoadingFiles,
    setLogs,
    setRunning,
  });

  /* -----------------------------
     Effects
  ----------------------------- */

  useEffect(() => {
    if (!activeAction) {
      setFiles({});
      setActiveFile(null);
      return;
    }
    loadFiles();
  }, [activeAction]);

  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    const openCreate = () => setCreateOpen(true);
    const openTemplates = () => setTemplatesOpen(true);
    const saveTemplate = () => handleSaveTemplate();
    const saveAll = () => handleSave();
    const run = () => handleRun();

    window.addEventListener('action:create', openCreate);
    window.addEventListener('templates:open', openTemplates);
    window.addEventListener('template:save', saveTemplate);
    window.addEventListener('editor:save-all', saveAll);
    window.addEventListener('editor:run', run);

    return () => {
      window.removeEventListener('action:create', openCreate);
      window.removeEventListener('templates:open', openTemplates);
      window.removeEventListener('template:save', saveTemplate);
      window.removeEventListener('editor:save-all', saveAll);
      window.removeEventListener('editor:run', run);
    };
  }, []);

  /* -----------------------------
     Handlers
  ----------------------------- */

  function updateFile(value) {
    setFiles((prev) => ({
      ...prev,
      [activeFile]: {
        ...prev[activeFile],
        value,
        dirty: true,
      },
    }));
  }

  async function handleSave() {
    await saveAllFiles(editorRef);
  }

  async function handleRun() {
    if (!canRun) return;
    await saveAllFiles(editorRef);
    await runFile();
  }

  function EditorLoadingState() {
    return (
      <div className='flex h-[90vh] min-w-0 flex-col gap-3 overflow-hidden animate-pulse'>
        {/* Toolbar skeleton */}
        <div className='flex items-center justify-between border-b pb-2'>
          <div className='flex gap-2'>
            <div className='h-8 w-24 rounded bg-muted' />
            <div className='h-8 w-20 rounded bg-muted' />
            <div className='h-8 w-28 rounded bg-muted' />
          </div>

          <div className='flex gap-2'>
            <div className='h-8 w-8 rounded bg-muted' />
            <div className='h-8 w-8 rounded bg-muted' />
            <div className='h-8 w-20 rounded bg-muted' />
            <div className='h-8 w-20 rounded bg-muted' />
          </div>
        </div>

        {/* Editor + Output skeleton */}
        <div className='grid flex-1 min-w-0 grid-cols-[60%_4px_1fr] rounded-md border bg-background overflow-hidden'>
          {/* Editor */}
          <div className='h-full bg-muted/40' />

          {/* Divider */}
          <div className='bg-border' />

          {/* Output */}
          <div className='flex flex-col bg-muted/30'>
            <div className='border-b px-3 py-1 text-xs text-muted-foreground'>
              Output
            </div>
            <div className='flex-1 space-y-2 px-3 py-2'>
              <div className='h-3 w-3/4 rounded bg-muted' />
              <div className='h-3 w-2/3 rounded bg-muted' />
              <div className='h-3 w-1/2 rounded bg-muted' />
            </div>
          </div>
        </div>

        {/* Status text */}
        <div className='text-xs text-muted-foreground px-1'>
          Loading action files and preparing editor…
        </div>
      </div>
    );
  }

  async function handleSaveTemplate() {
    if (!activeAction || templateSaving) return;

    try {
      setTemplateSaving(true);
      setTemplateSaved(false);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await createPrivateTemplate({
        supabase,
        ownerId: user.id,
        name: `${activeAction.name} Template`,
        description: 'Saved from editor',
        files,
      });

      setTemplateSaved(true);
      setTimeout(() => setTemplateSaved(false), 2000);
    } finally {
      setTemplateSaving(false);
    }
  }

  function handleResize(e) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const percentage =
      split === 'horizontal'
        ? ((e.clientY - rect.top) / rect.height) * 100
        : ((e.clientX - rect.left) / rect.width) * 100;
    setSplitSize(Math.min(90, Math.max(10, percentage)));
  }

  const gridStyle =
    split === 'horizontal'
      ? { gridTemplateRows: `${splitSize}% 4px 1fr` }
      : { gridTemplateColumns: `${splitSize}% 4px 1fr` };

  /* -----------------------------
     Render
  ----------------------------- */

  return (
    <>
      {/* ALWAYS mounted */}
      <CICDSetupDrawer
        open={cicdOpen}
        onOpenChange={setCicdOpen}
        actionId={activeAction?.id}
        portalId={activeAction?.portal_id}
        sourceCode={active?.value}
      />

      <AssignSecretsDialog
        open={open}
        onOpenChange={setOpen}
        actionId={activeAction?.id}
        portalId={activeAction?.portal_id}
      />

      <TemplatesSheet
        open={templatesOpen}
        onOpenChange={setTemplatesOpen}
        onSelectTemplate={() => {}}
      />
      <CreateActionDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          // 🔁 keep behaviour identical to sidebar
          window.dispatchEvent(new Event('actions:resync'));
        }}
      />

      {!activeAction ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant='icon'>
              <IconFolderCode />
            </EmptyMedia>
            <EmptyTitle>No Active Action</EmptyTitle>
            <EmptyDescription>
              You haven&apos;t selected or created any actions yet.
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent className='flex-row justify-center gap-2'>
            <Button onClick={() => setCreateOpen(true)}>
              Create New Action
            </Button>
            <Button variant='outline' onClick={() => setTemplatesOpen(true)}>
              Import Template
            </Button>
          </EmptyContent>
        </Empty>
      ) : loadingFiles ? (
        <EditorLoadingState />
      ) : !active ? (
        <div className='flex h-full items-center justify-center'>
          No files found for this action
        </div>
      ) : (
        <div className='flex h-[90vh] min-w-0 flex-col gap-3 overflow-hidden'>
          {/* Toolbar */}
          <div
            className='
    border-b pb-2
    flex flex-col-reverse gap-2
    xl:flex-row xl:items-center xl:justify-between
  '
          >
            {/* Tabs */}
            <div className='xl:order-1'>
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
            </div>

            {/* Actions */}
            <div
              className='
      flex flex-wrap items-center gap-2
      xl:order-2
    '
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() =>
                      setSplit(
                        split === 'horizontal' ? 'vertical' : 'horizontal',
                      )
                    }
                  >
                    {split === 'horizontal' ? <Columns /> : <Rows />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Swap output orientation</TooltipContent>
              </Tooltip>

              {/* TODO: Renable with new CICD drawer and secret management */}
              {/* <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setCicdOpen(true)}
                  >
                    <Workflow />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Update action on HubSpot</TooltipContent>
              </Tooltip> */}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={() => setOpen(true)}
                  >
                    <Key />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Select Environment Variables</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={handleSaveTemplate}
                    disabled={templateSaving}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        templateSaved ? 'text-blue-400' : ''
                      }`}
                      fill={templateSaved ? 'currentColor' : 'none'}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {templateSaved ? 'Template saved' : 'Save as template'}
                </TooltipContent>
              </Tooltip>

              <Button
                variant='outline'
                size='sm'
                onClick={handleSave}
                disabled={!hasDirtyFiles}
              >
                <Save className='mr-1 h-4 w-4' />
                Save
              </Button>

              <Button size='sm' onClick={handleRun} disabled={!canRun}>
                {running ? (
                  <Spinner className='mr-2' />
                ) : (
                  <Play className='mr-1 h-4 w-4' />
                )}
                Run
              </Button>
            </div>
          </div>

          {/* Editor + Output */}
          <div
            ref={containerRef}
            className='grid flex-1 min-w-0 overflow-hidden rounded-md border bg-background'
            style={gridStyle}
          >
            <MonacoEditor
              value={active.value}
              language={active.language}
              onChange={updateFile}
              onMount={(editor) => (editorRef.current = editor)}
            />

            <div
              onMouseDown={(e) => {
                e.preventDefault();
                const up = () => {
                  document.removeEventListener('mousemove', handleResize);
                  document.removeEventListener('mouseup', up);
                };
                document.addEventListener('mousemove', handleResize);
                document.addEventListener('mouseup', up);
              }}
              className={`bg-border ${
                split === 'horizontal'
                  ? 'h-1 cursor-row-resize'
                  : 'w-1 cursor-col-resize'
              }`}
            />

            <div className='flex flex-col bg-muted/30 overflow-hidden'>
              {/* Sticky header */}
              <div className='sticky top-0 z-10 flex items-center justify-between border-b bg-muted/30 px-3 py-1 text-xs text-muted-foreground'>
                <span>Output</span>
                <Button variant='ghost' size='icon' onClick={() => setLogs([])}>
                  <Trash2 className='h-4 w-4' />
                </Button>
              </div>

              {/* Scrollable content */}
              <ScrollArea className='flex-1 h-0'>
                <div className='px-3 py-2 font-mono text-xs whitespace-pre-wrap'>
                  {logs.length === 0
                    ? 'No output yet'
                    : logs.map((line, i) => <div key={i}>{line}</div>)}
                  <div ref={outputEndRef} />
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
