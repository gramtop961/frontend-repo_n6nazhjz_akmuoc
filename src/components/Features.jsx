import React from 'react';
import { Shield, Gauge, Wrench, Code2, Database, RefreshCw } from 'lucide-react';

const features = [
  {
    icon: <Gauge className="h-5 w-5" />,
    title: 'Script Analysis',
    desc: 'Detect performance bottlenecks, deprecated natives, and event vulnerabilities.',
  },
  {
    icon: <Wrench className="h-5 w-5" />,
    title: 'Optimization Engine',
    desc: 'Rewrite handlers, balance threads, and improve client/server separation.',
  },
  {
    icon: <Code2 className="h-5 w-5" />,
    title: 'Code Conversion',
    desc: 'Convert ESX ↔ QBCore, reformat to ox_lib style menus and contexts.',
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: 'Security Review',
    desc: 'Scan for exploitable patterns, unsafe events, and thread safety issues.',
  },
  {
    icon: <Database className="h-5 w-5" />,
    title: 'Dependency Checker',
    desc: 'Validate missing exports, libraries, and outdated dependencies.',
  },
  {
    icon: <RefreshCw className="h-5 w-5" />,
    title: 'Update Advisor',
    desc: 'Suggest modularization, ox_lib integration, and release readiness.',
  },
];

export default function Features() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white">Everything you need to ship better FiveM resources</h2>
          <p className="mt-2 text-white/70 max-w-2xl">
            Analyze, optimize, convert, and document scripts with production standards.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f, i) => (
          <div key={i} className="group p-4 rounded-2xl bg-white/5 ring-1 ring-white/10 hover:ring-white/20 transition">
            <div className="flex items-center gap-3 text-indigo-300">
              <div className="p-2 rounded-lg bg-indigo-500/10 ring-1 ring-indigo-400/20">{f.icon}</div>
              <h3 className="font-medium text-white">{f.title}</h3>
            </div>
            <p className="mt-2 text-sm text-white/70">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
