import React from 'react';
import { FileCode2, Loader2, CheckCircle2 } from 'lucide-react';

export default function PreviewPane({ working, progress, files = [], selectedIndex = 0, onSelect }) {
  const hasFiles = files && files.length > 0;
  const file = hasFiles ? files[selectedIndex] : null;

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

      <div className="grid gap-4 p-4">
        {!hasFiles && (
          <div className="text-xs text-white/60">No files loaded. Drop a resource folder or select multiple files to preview.</div>
        )}

        {hasFiles && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 text-[12px]">
              {files.slice(0, 12).map((f, i) => (
                <button
                  key={f.path + i}
                  className={
                    'px-2 py-1 rounded-md ring-1 transition ' +
                    (i === selectedIndex ? 'bg-indigo-500/20 ring-indigo-400/40 text-white' : 'bg-black/40 ring-white/10 text-white/70 hover:text-white')
                  }
                  onClick={() => onSelect?.(i)}
                  title={f.path}
                >
                  {f.path.length > 28 ? f.path.slice(-28) : f.path}
                </button>
              ))}
              {files.length > 12 && (
                <span className="text-white/60">+{files.length - 12} more</span>
              )}
            </div>

            {file && (
              <div className="text-xs text-white/70">
                <div className="text-white font-medium">{file.path}</div>
                <div className="text-white/60">{(file.size / 1024).toFixed(1)} KB • {file.type}</div>
              </div>
            )}

            {file?.content && (
              <pre className="max-h-80 overflow-auto text-[11px] leading-5 bg-black/40 p-3 rounded-lg ring-1 ring-white/10 text-white/80 whitespace-pre-wrap">
{file.content.slice(0, 4000)}
{file.content.length > 4000 ? '\n\n… truncated' : ''}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
