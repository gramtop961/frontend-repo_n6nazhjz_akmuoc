import React from 'react';
import { FileCode2, Loader2, CheckCircle2 } from 'lucide-react';

export default function PreviewPane({ working, progress, fileMeta, fileContent, resultNotes }) {
  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-indigo-300" />
          <span className="text-sm text-white/80">Live Preview</span>
        </div>
        {working ? (
          <div className="flex items-center gap-2 text-xs text-white/60"><Loader2 className="h-3.5 w-3.5 animate-spin"/> Processing {progress}%</div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-emerald-400"><CheckCircle2 className="h-3.5 w-3.5"/> Ready</div>
        )}
      </div>

      <div className="p-4 grid gap-4">
        {fileMeta ? (
          <div className="text-xs text-white/70">
            <div className="text-white font-medium">{fileMeta.name}</div>
            <div className="text-white/60">{(fileMeta.size / 1024).toFixed(1)} KB • {fileMeta.type}</div>
          </div>
        ) : (
          <div className="text-xs text-white/60">No file loaded. Drop a file to see a quick preview.</div>
        )}

        {fileContent && (
          <pre className="max-h-64 overflow-auto text-[11px] leading-5 bg-black/40 p-3 rounded-lg ring-1 ring-white/10 text-white/80 whitespace-pre-wrap">
{fileContent.slice(0, 3000)}
{fileContent.length > 3000 ? '\n\n… truncated' : ''}
          </pre>
        )}

        {resultNotes?.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs text-white/60">Highlights</div>
            <ul className="list-disc pl-5 text-sm text-white/80 space-y-1">
              {resultNotes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
