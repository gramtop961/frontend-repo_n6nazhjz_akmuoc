import React from 'react';
import { GitBranch, FileText, TerminalSquare, Sparkles } from 'lucide-react';

export default function Toolkit() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-12">
      <div className="rounded-2xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-br from-slate-900/60 to-indigo-900/20">
        <div className="grid md:grid-cols-2 gap-0">
          <div className="p-6 md:p-8">
            <h3 className="text-xl md:text-2xl font-semibold text-white">Your all-in-one FiveM engineering copilot</h3>
            <p className="mt-2 text-white/70">
              Generate production-ready scripts using ox_lib, ESX, and modern patterns. Get instant
              suggestions, auto-fixes, and documentation.
            </p>

            <ul className="mt-5 space-y-3 text-sm">
              <li className="flex items-start gap-3 text-white/80"><Sparkles className="h-4 w-4 text-amber-400 mt-0.5"/> AI Script Generator with comments and config</li>
              <li className="flex items-start gap-3 text-white/80"><TerminalSquare className="h-4 w-4 text-emerald-400 mt-0.5"/> Auto-Fix mode for events, variables, and threads</li>
              <li className="flex items-start gap-3 text-white/80"><GitBranch className="h-4 w-4 text-sky-400 mt-0.5"/> Framework conversions with accurate events</li>
              <li className="flex items-start gap-3 text-white/80"><FileText className="h-4 w-4 text-indigo-400 mt-0.5"/> Auto README and changelog generator</li>
            </ul>
          </div>

          <div className="p-6 md:p-8 bg-black/30 border-l border-white/10">
            <div className="text-xs text-white/60">Example output</div>
            <pre className="mt-2 text-[11px] leading-5 text-white/80 bg-black/40 p-4 rounded-xl ring-1 ring-white/10 overflow-auto">
{`-- fxmanifest.lua
fx_version 'cerulean'
game 'gta5'

lua54 'yes'

author 'FlamesBlue'
description 'Vehicle impound with ox_lib + ESX'

client_scripts {
  'client/*.lua'
}
server_scripts {
  '@oxmysql/lib/MySQL.lua',
  'server/*.lua'
}
shared_scripts {
  '@ox_lib/init.lua',
  'config.lua'
}
`}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
