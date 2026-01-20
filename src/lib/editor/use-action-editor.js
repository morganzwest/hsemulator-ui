import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import { inferLanguage } from '@/lib/editor/infer-language';

/* -----------------------------
   Helpers
----------------------------- */

function formatTimestamp(ts) {
  if (!ts) return '';
  const ms =
    ts.secs_since_epoch * 1000 +
    Math.floor((ts.nanos_since_epoch || 0) / 1e6);
  return new Date(ms).toISOString();
}

function formatEvent(event) {
  const ts = formatTimestamp(event.timestamp);
  return ts
    ? `[${ts}] ${event.kind}`
    : `${event.kind}`;
}

/* -----------------------------
   Hook
----------------------------- */

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
    const basePath = `${owner_id}/${id}`;

    setLoadingFiles(true);
    setLogs([]);

    const { data: objects, error } = await supabase
      .storage
      .from('actions')
      .list(basePath);

    if (error) {
      setLogs([`✖ Failed to load files: ${error.message}`]);
      setLoadingFiles(false);
      return;
    }

    const entries = await Promise.all(
      (objects ?? [])
        .filter(o => o.name && !o.name.endsWith('/'))
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(async obj => {
          const { data, error } = await supabase
            .storage
            .from('actions')
            .download(`${basePath}/${obj.name}`);

          if (error) return null;

          return [
            obj.name,
            {
              language: inferLanguage(obj.name),
              value: await data.text(),
              dirty: false,
            },
          ];
        })
    );

    const loaded = Object.fromEntries(entries.filter(Boolean));
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

    await editorRef?.current
      ?.getAction('editor.action.formatDocument')
      ?.run();

    const dirtyFiles = Object.entries(files).filter(
      ([, f]) => f.dirty
    );

    if (dirtyFiles.length === 0) return;

    try {
      await Promise.all(
        dirtyFiles.map(([name, file]) =>
          supabase.storage
            .from('actions')
            .upload(
              `${basePath}/${name}`,
              new Blob([file.value]),
              {
                upsert: true,
                contentType:
                  file.language === 'json'
                    ? 'application/json'
                    : 'text/plain',
              }
            )
        )
      );

      await supabase
        .from('actions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', id);

      setFiles(prev =>
        Object.fromEntries(
          Object.entries(prev).map(([k, v]) => [
            k,
            { ...v, dirty: false },
          ])
        )
      );

      setLogs(l => [...l, '✔ Files saved']);
    } catch (err) {
      setLogs(l => [...l, `✖ Save failed: ${err.message}`]);
    }
  }

  /* -----------------------------
     Run action
  ----------------------------- */

  async function runFile({ activeFile }) {
    if (!activeAction || !activeFile) return;

    const actionFile = files[activeFile];
    if (!actionFile) return;

    setRunning(true);
    setLogs(prev => [
  ...prev,
  '',
  `▶ Running ${activeFile}`,
]);


    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_RUNTIME_URL}/execute`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer dev_secret_key',
          },
          body: JSON.stringify({
            mode: 'execute',
            config: {
              version: 1,
              action: {
                language:
                  actionFile.language === 'python'
                    ? 'python'
                    : 'js',
                entry: `actions/${activeFile}`,
                source: actionFile.value,
              },
              fixtures: [
                {
                  name: 'fixtures/event.json',
                  source: '{ "input": "hello" }',
                },
              ],
              env: {
                HUBSPOT_TOKEN: 'pat-test-token',
                HUBSPOT_BASE_URL: 'https://api.hubapi.com',
              },
              runtime: {
                node: 'node',
                python: 'python',
              },
              snapshots: { enabled: true },
              repeat: 1,
            },
          }),
        }
      );

      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || `Execution failed (${res.status})`);
      }

      const lines = [];

      /* ---- Summary ---- */
      if (payload?.summary?.result) {
        const r = payload.summary.result;
        lines.push('✔ Execution completed');
        lines.push(`Result: ${r.ok ? 'OK' : 'FAILED'}`);
        lines.push(`Runs: ${r.runs}`);
        lines.push(`Max duration: ${r.max_duration_ms}ms`);
        lines.push(`Max memory: ${r.max_memory_kb} KB`);
        lines.push(`Snapshots OK: ${r.snapshots_ok}`);
      }

      /* ---- Events ---- */
      if (Array.isArray(payload?.events)) {
        lines.push('');
        lines.push('--- Execution events ---');
        payload.events.forEach(e => {
          lines.push(formatEvent(e));
        });
      }

      setLogs(l => [...l, ...lines]);
    } catch (err) {
      setLogs(l => [...l, `✖ ${err.message}`]);
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
