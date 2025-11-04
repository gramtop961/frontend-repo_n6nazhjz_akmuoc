import React, { useRef, useState } from 'react';
import { Upload, File as FileIcon } from 'lucide-react';

export default function FileDrop({ onFileLoad }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileMeta, setFileMeta] = useState(null);

  const handleFiles = async (files) => {
    const file = files?.[0];
    if (!file) return;
    const text = await file.text();
    const meta = { name: file.name, size: file.size, type: file.type || 'text/plain' };
    setFileMeta(meta);
    onFileLoad?.({ content: text, meta });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
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
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-400/30 px-3 py-2 text-sm text-white hover:bg-indigo-500/20"
      >
        <Upload className="h-4 w-4" /> Choose file
      </button>
      <p className="mt-3 text-xs text-white/60">or drag & drop your Lua or resource files here</p>

      {fileMeta && (
        <div className="mt-4 flex items-center gap-3 rounded-xl bg-black/40 p-3 ring-1 ring-white/10">
          <FileIcon className="h-4 w-4 text-indigo-300" />
          <div className="text-xs text-white/70">
            <div className="font-medium text-white">{fileMeta.name}</div>
            <div className="text-white/60">{(fileMeta.size / 1024).toFixed(1)} KB</div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        accept=".lua,.txt,.json,.md,.cfg,.config,.yml,.yaml,.xml,.ini,.js,.ts"
      />
    </div>
  );
}
