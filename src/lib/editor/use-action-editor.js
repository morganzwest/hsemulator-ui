import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { inferLanguage } from '@/lib/editor/infer-language';

export function useActionEditor({
  activeAction,
  files,
  setFiles,
  setActiveFile,
  setLoadingFiles,
  setLogs,
  setRunning,
}) {
  const supabase = createSupabaseBrowserClient();

  /* -----------------------------
     Load files
  ----------------------------- */

  async function loadFiles() {
    if (!activeAction) return;

    const { id, owner_id } = activeAction;
    const actionPath = `${owner_id}/${id}`;

    setLoadingFiles(true);
    setLogs([]);

    const { data: objects, error } = await supabase.storage
      .from('actions')
      .list(actionPath);

    if (error) {
      console.error('[useActionEditor] list failed', error);
      setLoadingFiles(false);
      return;
    }

    const loaded = {};

    for (const obj of objects ?? []) {
      const { data, error } = await supabase.storage
        .from('actions')
        .download(`${actionPath}/${obj.name}`);

      if (error) continue;

      loaded[obj.name] = {
        language: inferLanguage(obj.name),
        value: await data.text(),
        dirty: false,
      };
    }

    const filenames = Object.keys(loaded);

    setFiles(loaded);
    setActiveFile(filenames[0] ?? null);
    setLoadingFiles(false);
  }

  /* -----------------------------
     Save files
  ----------------------------- */

  async function saveAllFiles(editorRef) {
    if (!activeAction) return;

    const { id, owner_id } = activeAction;
    const basePath = `${owner_id}/${id}`;

    editorRef?.current
      ?.getAction('editor.action.formatDocument')
      ?.run();

    const uploads = Object.entries(files).map(async ([name, file]) => {
      if (!file.dirty) return;

      const { error } = await supabase.storage
        .from('actions')
        .upload(`${basePath}/${name}`, new Blob([file.value]), {
          upsert: true,
          contentType: 'text/plain',
        });

      if (error) throw error;
    });

    await Promise.all(uploads);

    await supabase
      .from('actions')
      .update({})
      .eq('id', id);

    setFiles((prev) =>
      Object.fromEntries(
        Object.entries(prev).map(([k, v]) => [
          k,
          { ...v, dirty: false },
        ])
      )
    );
  }

  /* -----------------------------
     Run action
  ----------------------------- */

  async function runFile({ activeFile, source }) {
    setRunning(true);
    setLogs((l) => [...l, `▶ Running ${activeFile}`]);

    try {
      await fetch(`${process.env.NEXT_PUBLIC_RUNTIME_URL}/execute`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer dev_secret_key`,
  },
  body: JSON.stringify({
    mode: 'execute',
    config: {
      version: 1,
      action: {
        type: 'js',
        entry: 'actions/action.js',
      },
      fixtures: ['fixtures/event.json'],
      env: {
        HUBSPOT_TOKEN: 'pat-test-token',
        HUBSPOT_BASE_URL: 'https://api.hubapi.com',
      },
      runtime: {
        node: 'node',
        python: 'python',
      },
      snapshots: {
        enabled: true,
      },
      repeat: 1,
    },
  }),
});

      setLogs((l) => [...l, '✔ Execution completed']);
    } catch (err) {
      console.error(err);
      setLogs((l) => [...l, '✖ Execution failed']);
    } finally {
      setRunning(false);
    }
  }

  return {
    loadFiles,
    saveAllFiles,
    runFile,
  };
}
