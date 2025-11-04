import React from 'react';
import { Lightbulb, ShieldCheck, Gauge, GitCompare } from 'lucide-react';

export default function Suggestions({ items = [], onApply }) {
  const defaults = [
    { icon: <Gauge className="h-4 w-4" />, title: 'Optimize threads', desc: 'Consolidate CreateThread usage and debounce heavy loops.' },
    { icon: <ShieldCheck className="h-4 w-4" />, title: 'Harden events', desc: 'Validate server events and sanitize client inputs.' },
    { icon: <GitCompare className="h-4 w-4" />, title: 'Convert to ox_lib', desc: 'Replace legacy menus with ox_lib contexts and callbacks.' },
  ];
  const data = items.length ? items : defaults;

  return (
    <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center gap-2 text-white/80 text-sm">
        <Lightbulb className="h-4 w-4 text-amber-300" /> Suggested improvements
      </div>
      <div className="p-4 grid sm:grid-cols-2 gap-3">
        {data.map((s, i) => (
          <div key={i} className="p-3 rounded-xl bg-black/40 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-indigo-300">{s.icon}<div className="text-white font-medium">{s.title}</div></div>
            <p className="mt-1 text-sm text-white/70">{s.desc}</p>
            {s.action && (
              <button onClick={() => onApply?.(s)} className="mt-2 text-xs text-indigo-300 hover:text-indigo-200 underline">Apply suggestion</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
