import React from 'react';
import { Flame } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 p-[1px]">
            <div className="h-full w-full rounded-[6px] bg-black/80 grid place-items-center">
              <Flame className="h-4 w-4 text-white" />
            </div>
          </div>
          <span className="font-semibold tracking-tight">NUI Testing Lab</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
          <a href="#workspace" className="hover:text-white">Workspace</a>
          <a href="#versions" className="hover:text-white">Versions</a>
        </nav>
      </div>
    </header>
  );
}
