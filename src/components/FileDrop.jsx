import React, { useRef, useState } from 'react';
import { Upload, FolderOpen, File as FileIcon } from 'lucide-react';

export default function FileDrop({ onFilesLoad }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [summary, setSummary] = useState(null);

  const readAllFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return [];

    const mapped = await Promise.all(
      files.map(async (f) => {
        const text = await f.text().catch(() => '');
        return {
          name: f.name,
          path: (f.webkitRelativePath || f.name) || f.name,
          size: f.size,
          type: f.type || 'text/plain',
          content: text,
        };
      })
    );

    // summarize for UI chip
    const totalSize = mapped.reduce((acc, m) => acc + (m.size || 0), 0);
    setSummary({ count: mapped.length, size: totalSize });
    return mapped;
  };

  const handleFileInput = async (files) => {
    const mapped = await readAllFiles(files);
    if (mapped.length) onFilesLoad?.(mapped);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    // Use files directly; folder drag traversal is inconsistent across browsers
    const mapped = await readAllFiles(e.dataTransfer.files);
    if (mapped.length) onFilesLoad?.(mapped);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={[
        'relative flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed p-6 md:p-8 transition',
        isDragging ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 bg-white/5 hover:bg-white/10',
      ].join(' ')}
    >
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-400/30 px-3 py-2 text-sm text-white hover:bg-indigo-500/20"
        >
          <Upload className="h-4 w-4" /> Choose files
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-sky-500/10 ring-1 ring-sky-400/30 px-3 py-2 text-sm text-white hover:bg-sky-500/20"
        >
          <FolderOpen className="h-4 w-4" /> Import resource folder
        </button>
      </div>
      <p className="mt-3 text-xs text-white/60">Drop your entire resource (client, server, shared, config, fxmanifest.lua) or select a folder.</p>

      {summary && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/40 p-3 ring-1 ring-white/10">
          <FileIcon className="h-4 w-4 text-indigo-300" />
          <div className="text-xs text-white/70">
            <div className="font-medium text-white">{summary.count} files</div>
            <div className="text-white/60">{(summary.size / 1024).toFixed(1)} KB total</div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileInput(e.target.files)}
        webkitdirectory=""
        directory=""
        multiple
        accept=".lua,.txt,.json,.md,.cfg,.config,.yml,.yaml,.xml,.ini,.js,.ts,.html,.css"
      />
    </div>
  );
}
