import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Upload, FileCode2, PlayCircle, Bug, Save, RefreshCcw, Package, Terminal, Download } from 'lucide-react';
import Editor from '@monaco-editor/react';
import JSZip from 'jszip';

const mimeFromPath = (path) => {
  const ext = path.split('.').pop().toLowerCase();
  switch (ext) {
    case 'html': return 'text/html';
    case 'css': return 'text/css';
    case 'js': return 'application/javascript';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'svg': return 'image/svg+xml';
    case 'webp': return 'image/webp';
    case 'lua': return 'text/plain';
    default: return 'application/octet-stream';
  }
};

const defaultTabs = ['Preview', 'Console', 'Code', 'Edit Mode', 'Versions'];

export default function NUITester() {
  const [files, setFiles] = useState({}); // path -> { name, path, content (string), type }
  const [entryPath, setEntryPath] = useState('');
  const [activeTab, setActiveTab] = useState('Preview');
  const [selectedPath, setSelectedPath] = useState('');
  const [iframeURL, setIframeURL] = useState('');
  const [logs, setLogs] = useState([]);
  const [sendPayload, setSendPayload] = useState('{"action":"ping","value":1}');
  const [fakeEnv, setFakeEnv] = useState(true);
  const [versions, setVersions] = useState([]); // { id, timestamp, files }
  const iframeRef = useRef(null);

  // Receive messages from iframe (console, callbacks, edited html)
  useEffect(() => {
    const onMsg = (e) => {
      const data = e.data;
      if (!data || !data.__nuiTester) return;
      const { kind, payload } = data;
      if (kind === 'console') {
        setLogs((prev) => [...prev, { type: payload.level, message: payload.args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '), ts: Date.now() }]);
      } else if (kind === 'callback') {
        setLogs((prev) => [...prev, { type: 'callback', message: `${payload.name}: ${JSON.stringify(payload.data)}`, ts: Date.now() }]);
      } else if (kind === 'editedHtml') {
        // apply edited HTML to entry
        if (entryPath) {
          setFiles((prev) => ({ ...prev, [entryPath]: { ...prev[entryPath], content: payload.html } }));
          setLogs((prev) => [...prev, { type: 'info', message: 'Applied edits from Edit Mode to index.html', ts: Date.now() }]);
          rebuild();
        }
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [entryPath]);

  const handleUpload = useCallback(async (event) => {
    const fileList = Array.from(event.target.files || []);
    if (!fileList.length) return;

    const next = {};
    for (const f of fileList) {
      // Compute a relative path; prefer webkitRelativePath when present
      const rel = f.webkitRelativePath && f.webkitRelativePath.length > 0 ? f.webkitRelativePath : f.name;
      const path = rel.replace(/\\/g, '/');
      const text = await f.text();
      next[path] = { name: f.name, path, content: text, type: mimeFromPath(path) };
    }

    // detect entry index.html
    const entryCandidates = Object.keys(next).filter(p => /(^|\/)ui\/(index\.html)$/i.test(p) || /(^|\/)index\.html$/i.test(p));
    const entry = entryCandidates.sort((a,b) => a.length - b.length)[0] || '';

    setFiles(next);
    setEntryPath(entry);
    setSelectedPath(entry || Object.keys(next)[0]);

    // snapshot version 1
    setVersions([{ id: 1, timestamp: Date.now(), files: next }]);

    setTimeout(() => rebuild(next, entry), 0);
  }, []);

  const buildBlobMap = useCallback((fs) => {
    const map = {};
    Object.values(fs).forEach(f => {
      const blob = new Blob([f.content], { type: f.type || 'application/octet-stream' });
      map[f.path] = URL.createObjectURL(blob);
    });
    return map;
  }, []);

  const rewriteHtmlWithBridge = useCallback((html, fs, blobMap) => {
    try {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      // Rewrite src/href for local files
      const attrTargets = [
        ...Array.from(doc.querySelectorAll('[src]')).map(el => ({ el, attr: 'src' })),
        ...Array.from(doc.querySelectorAll('[href]')).map(el => ({ el, attr: 'href' })),
      ];
      attrTargets.forEach(({ el, attr }) => {
        const val = el.getAttribute(attr);
        if (!val) return;
        if (/^https?:\/\//i.test(val) || val.startsWith('data:') || val.startsWith('blob:')) return;
        // resolve into uploaded fs path
        const guessPaths = [val, `ui/${val}`];
        const found = guessPaths.find(p => !!blobMap[p]);
        if (found) el.setAttribute(attr, blobMap[found]);
      });

      // Inject bridge script
      const bridge = doc.createElement('script');
      bridge.type = 'text/javascript';
      bridge.textContent = `(() => {
        const send = (kind, payload) => {
          window.parent?.postMessage({ __nuiTester: true, kind, payload }, '*');
        };
        const levels = ['log','info','warn','error'];
        levels.forEach(l => {
          const orig = console[l];
          console[l] = function(...args){ try{ send('console', { level: l, args }); }catch(e){}; orig && orig.apply(console, args); };
        });
        // Fake FiveM API
        window.GetParentResourceName = () => 'nui-tester';
        window.__nui_callbacks = {};
        window.RegisterNUICallback = (name, cb) => { window.__nui_callbacks[name] = cb; };
        window.__nui_invoke = async (name, data) => {
          try {
            const cb = window.__nui_callbacks[name];
            if (cb) {
              cb(data, (res) => send('callback', { name, data: res }));
            } else {
              send('console', { level: 'warn', args:[`No NUI callback registered for ${name}`]});
            }
          } catch (err) {
            send('console', { level: 'error', args:[String(err)]});
          }
        };
        // Receive messages from parent
        window.addEventListener('message', (e) => {
          const d = e.data || {};
          if (d.__nuiTester && d.kind === 'send') {
            window.dispatchEvent(new MessageEvent('message', { data: d.payload }));
          } else if (d.__nuiTester && d.kind === 'invoke') {
            window.__nui_invoke(d.name, d.data);
          } else if (d.__nuiTester && d.kind === 'toggleEdit') {
            window.__nui_enableEditMode(d.enabled);
          }
        });
        // Simple edit mode
        let __edit_on = false; let __sel = null; let __ox = 0, __oy = 0, __sx = 0, __sy = 0;
        const outline = document.createElement('div');
        Object.assign(outline.style, { position:'fixed', border:'1px dashed #7c3aed', pointerEvents:'none', zIndex: 2147483647 });
        document.body.appendChild(outline);
        const updateOutline = (el) => {
          if (!el) { outline.style.display='none'; return; }
          const r = el.getBoundingClientRect();
          outline.style.display='block'; outline.style.left=r.left+'px'; outline.style.top=r.top+'px'; outline.style.width=r.width+'px'; outline.style.height=r.height+'px';
        };
        const onDown = (e) => {
          if (!__edit_on) return;
          e.preventDefault();
          __sel = e.target; const r = __sel.getBoundingClientRect();
          __ox = r.left; __oy = r.top; __sx = e.clientX; __sy = e.clientY;
          updateOutline(__sel);
        };
        const onMove = (e) => {
          if (!__edit_on || !__sel) return;
          const dx = e.clientX - __sx; const dy = e.clientY - __sy;
          __sel.style.position = 'relative';
          __sel.style.left = (parseFloat(__sel.style.left||'0') + dx) + 'px';
          __sel.style.top = (parseFloat(__sel.style.top||'0') + dy) + 'px';
          __sx = e.clientX; __sy = e.clientY; updateOutline(__sel);
        };
        const onUp = () => { __sel = null; };
        window.__nui_enableEditMode = (v) => {
          __edit_on = !!v;
          document.body.style.cursor = v ? 'move' : '';
          if (v) {
            document.addEventListener('mousedown', onDown, true);
            document.addEventListener('mousemove', onMove, true);
            document.addEventListener('mouseup', onUp, true);
          } else {
            document.removeEventListener('mousedown', onDown, true);
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('mouseup', onUp, true);
            updateOutline(null);
          }
        };
        window.__nui_exportHtml = () => {
          try { const html = document.documentElement.outerHTML; send('editedHtml', { html }); } catch(e) { send('console', { level:'error', args:[String(e)]}); }
        };
        console.info('[NUI Tester] Bridge initialized');
      })();`;
      doc.body.appendChild(bridge);
      return '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
    } catch (err) {
      return html;
    }
  }, []);

  const rebuild = useCallback((fsArg, entryArg) => {
    const fs = fsArg || files;
    const entry = entryArg || entryPath;
    if (!entry || !fs[entry]) return;
    const blobMap = buildBlobMap(fs);
    const html = rewriteHtmlWithBridge(fs[entry].content, fs, blobMap);
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    setIframeURL((old) => { if (old) URL.revokeObjectURL(old); return url; });
  }, [files, entryPath, buildBlobMap, rewriteHtmlWithBridge]);

  const sendToIframe = useCallback((kind, payload) => {
    const w = iframeRef.current?.contentWindow;
    if (!w) return;
    w.postMessage({ __nuiTester: true, kind, ...payload }, '*');
  }, []);

  const handleSendMessage = () => {
    try {
      const data = JSON.parse(sendPayload);
      sendToIframe('send', { payload: data });
      setLogs((prev)=>[...prev,{ type:'out', message:`SendNUIMessage ${sendPayload}`, ts:Date.now()}]);
    } catch (e) {
      setLogs((prev)=>[...prev,{ type:'error', message:`Invalid JSON: ${String(e)}`, ts:Date.now()}]);
    }
  };

  const handleInvoke = () => {
    const name = prompt('NUI Callback name (e.g., saveSettings)');
    if (!name) return;
    let data = {};
    try { const v = prompt('Data (JSON) for callback', '{}'); data = v ? JSON.parse(v) : {}; } catch {}
    sendToIframe('invoke', { name, data });
    setLogs((prev)=>[...prev,{ type:'out', message:`Invoke NUI callback ${name} with ${JSON.stringify(data)}`, ts:Date.now()}]);
  };

  const addVersion = () => {
    setVersions((prev) => [
      ...prev,
      { id: (prev[prev.length-1]?.id || 0) + 1, timestamp: Date.now(), files }
    ]);
  };

  const downloadZip = async (snapshot) => {
    const zip = new JSZip();
    const snap = snapshot?.files || files;
    Object.values(snap).forEach(f => {
      zip.file(f.path, f.content);
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'nui_build.zip'; a.click();
    setTimeout(()=> URL.revokeObjectURL(url), 1000);
  };

  const fileList = useMemo(() => Object.values(files).sort((a,b)=>a.path.localeCompare(b.path)), [files]);
  const selectedFile = files[selectedPath];

  useEffect(() => { if (fakeEnv) sendToIframe('toggleEdit', { enabled: false }); }, [fakeEnv, sendToIframe]);

  return (
    <section id="workspace" className="mx-auto max-w-6xl px-4">
      {/* Upload */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 cursor-pointer border border-indigo-400/20">
              <Upload className="h-4 w-4" />
              <span className="text-sm">Upload ui/ folder or files</span>
              <input type="file" className="hidden" webkitdirectory="true" multiple onChange={handleUpload} />
            </label>
            <button onClick={rebuild} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">
              <RefreshCcw className="h-4 w-4" /><span className="text-sm">Rebuild Preview</span>
            </button>
            <button onClick={addVersion} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">
              <Save className="h-4 w-4" /><span className="text-sm">Save Version</span>
            </button>
            <button onClick={() => downloadZip()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10">
              <Package className="h-4 w-4" /><span className="text-sm">Download ZIP</span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-white/70">
              <input type="checkbox" className="accent-indigo-500" checked={fakeEnv} onChange={(e)=>setFakeEnv(e.target.checked)} />
              Fake FiveM Environment
            </label>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4 flex gap-2">
        {defaultTabs.map(t => (
          <button key={t} onClick={()=>setActiveTab(t)} className={`px-3 py-2 rounded-xl border text-sm ${activeTab===t? 'bg-indigo-500/15 border-indigo-400/30 text-white' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'}`}>{t}</button>
        ))}
      </div>

      {/* Main area */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Sidebar: file tree + tools */}
        <aside className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-3 max-h-[600px] overflow-auto">
          <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2"><FileCode2 className="h-4 w-4"/> Files</div>
          <ul className="space-y-1">
            {fileList.map(f => (
              <li key={f.path}>
                <button onClick={()=>{setSelectedPath(f.path); setActiveTab('Code');}} className={`w-full text-left px-2 py-1 rounded hover:bg-white/10 text-xs ${selectedPath===f.path? 'bg-white/10 text-white' : 'text-white/80'}`}>{f.path}</button>
              </li>
            ))}
          </ul>
          <div className="mt-4 border-t border-white/10 pt-3">
            <div className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2"><Terminal className="h-4 w-4"/> Tester</div>
            <label className="block text-xs text-white/60 mb-1">SendNUIMessage payload (JSON)</label>
            <textarea className="w-full bg-black/40 border border-white/10 rounded p-2 text-xs font-mono min-h-[100px]" value={sendPayload} onChange={(e)=>setSendPayload(e.target.value)} />
            <div className="flex gap-2 mt-2">
              <button onClick={handleSendMessage} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25 border border-emerald-400/20"><PlayCircle className="h-4 w-4"/> Send</button>
              <button onClick={handleInvoke} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 border border-indigo-400/20"><Bug className="h-4 w-4"/> Invoke Callback</button>
            </div>
          </div>
        </aside>

        {/* Content */}
        <div className="lg:col-span-9">
          {activeTab === 'Preview' && (
            <div className="rounded-2xl border border-white/10 bg-[#0a0d14] overflow-hidden">
              {iframeURL ? (
                <iframe ref={iframeRef} title="nui-preview" src={iframeURL} sandbox="allow-scripts allow-same-origin allow-popups" className="w-full h-[600px]" />
              ) : (
                <div className="h-[300px] grid place-items-center text-white/50 text-sm">Upload your ui/ to start previewing</div>
              )}
            </div>
          )}

          {activeTab === 'Console' && (
            <div className="rounded-2xl border border-white/10 bg-black/60 p-3 h-[600px] overflow-auto font-mono text-xs">
              {logs.length === 0 && <div className="text-white/40">No logs yet. Interact with your UI or send a message.</div>}
              <ul className="space-y-1">
                {logs.map((l,i) => (
                  <li key={i} className={`${l.type==='error' ? 'text-rose-300' : l.type==='warn' ? 'text-yellow-300' : l.type==='out' ? 'text-emerald-300' : l.type==='callback' ? 'text-sky-300' : 'text-white/80'}`}>[{new Date(l.ts).toLocaleTimeString()}] {l.message}</li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'Code' && (
            <div className="rounded-2xl border border-white/10 bg-[#0b0f18]">
              <div className="flex items-center justify-between p-3 border-b border-white/10">
                <div className="text-sm text-white/80 truncate">{selectedPath || 'Select a file from the left'}</div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { if (selectedFile) { setFiles(prev => ({ ...prev, [selectedPath]: { ...selectedFile, content: selectedFile.content } })); rebuild(); } }} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm">
                    <RefreshCcw className="h-4 w-4 inline mr-1"/> Reload
                  </button>
                  <button onClick={() => { addVersion(); rebuild(); }} className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-400/20 text-emerald-200 hover:bg-emerald-500/25 text-sm">
                    <Save className="h-4 w-4 inline mr-1"/> Save & Update
                  </button>
                </div>
              </div>
              <div className="h-[560px]">
                {selectedFile ? (
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    defaultLanguage={selectedPath.endsWith('.css') ? 'css' : selectedPath.endsWith('.js') ? 'javascript' : selectedPath.endsWith('.lua') ? 'lua' : 'html'}
                    value={selectedFile.content}
                    onChange={(v)=> setFiles(prev => ({ ...prev, [selectedPath]: { ...selectedFile, content: v ?? '' } }))}
                  />
                ) : (
                  <div className="h-full grid place-items-center text-white/40 text-sm">Select a file from the left</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Edit Mode' && (
            <div className="rounded-2xl border border-white/10 overflow-hidden">
              {iframeURL ? (
                <div className="relative">
                  <div className="absolute inset-x-0 top-0 z-10 p-2 flex items-center gap-2 bg-black/40 border-b border-white/10">
                    <label className="inline-flex items-center gap-2 text-xs text-white/80">
                      <input type="checkbox" className="accent-indigo-500" onChange={(e)=> sendToIframe('toggleEdit', { enabled: e.target.checked })} /> Enable drag to reposition elements
                    </label>
                    <button onClick={()=> sendToIframe('send', { payload: { action: 'tester:ping' }})} className="ml-2 px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/15">Ping</button>
                    <button onClick={()=> sendToIframe('invoke', { name: 'save', data: { ok: true }})} className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/15">Invoke save()</button>
                    <button onClick={()=> sendToIframe('send', { payload: { action: 'SetDisplay', display: true }})} className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/15">SetDisplay</button>
                    <button onClick={()=> sendToIframe('send', { payload: { action: 'updateData', value: 123 }})} className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/15">updateData</button>
                    <button onClick={()=> sendToIframe('send', { payload: { action: 'close' }})} className="px-2 py-1 rounded bg-white/10 border border-white/10 text-xs hover:bg-white/15">close</button>
                    <div className="flex-1" />
                    <button onClick={()=> iframeRef.current?.contentWindow?.__nui_exportHtml?.()} className="px-2 py-1 rounded bg-indigo-500/15 border border-indigo-400/20 text-indigo-200 text-xs hover:bg-indigo-500/25">Apply edits to code</button>
                  </div>
                  <iframe ref={iframeRef} title="nui-preview-edit" src={iframeURL} sandbox="allow-scripts allow-same-origin allow-popups" className="w-full h-[620px]" />
                </div>
              ) : (
                <div className="h-[300px] grid place-items-center text-white/50 text-sm">Upload your ui/ to start editing</div>
              )}
            </div>
          )}

          {activeTab === 'Versions' && (
            <div id="versions" className="rounded-2xl border border-white/10 bg-white/5 p-3">
              {versions.length === 0 && <div className="text-white/60 text-sm">No versions yet. Save a version to track your changes.</div>}
              <ul className="divide-y divide-white/10">
                {versions.map(v => (
                  <li key={v.id} className="py-3 flex items-center gap-3">
                    <div className="flex-1 text-sm text-white/80">Version {v.id} — {new Date(v.timestamp).toLocaleString()}</div>
                    <button onClick={()=> setFiles(v.files) || setTimeout(()=>rebuild(v.files, entryPath), 0)} className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm">Revert</button>
                    <button onClick={()=> downloadZip(v)} className="ml-2 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-sm"><Download className="h-4 w-4"/> ZIP</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Helper: auto-switch to preview after upload */}
      {iframeURL && activeTab === 'Preview' && (
        <div className="mt-2 text-xs text-white/50">Sandboxed with allow-scripts and same-origin for asset blobs. Use the sidebar to send messages or invoke callbacks.</div>
      )}
    </section>
  );
}
