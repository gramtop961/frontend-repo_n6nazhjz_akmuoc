import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-4 pb-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
        <p className="text-sm text-white/60">
          FlamesBlue AI DevTools — Build, optimize, and ship FiveM scripts faster.
        </p>
        <p className="text-sm text-white/60 flex items-center gap-1">
          Made with <Heart className="h-4 w-4 text-rose-400" /> for ESX, ox_lib, and creators.
        </p>
      </div>
    </footer>
  );
}
