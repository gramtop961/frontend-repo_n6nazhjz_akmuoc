import React from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Toolkit from './components/Toolkit';
import Footer from './components/Footer';
import { Flame } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-white">
      {/* Top Bar */}
      <header className="sticky top-0 z-20 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20 border-b border-white/10">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 p-[1px]">
              <div className="h-full w-full rounded-[6px] bg-black/80 grid place-items-center">
                <Flame className="h-4 w-4 text-white" />
              </div>
            </div>
            <span className="font-semibold tracking-tight">FlamesBlue AI DevTools</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-white/70">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#toolkit" className="hover:text-white">Toolkit</a>
            <a href="#docs" className="hover:text-white">Docs</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-6 md:space-y-10">
        <Hero />
        <div id="features">
          <Features />
        </div>
        <div id="toolkit">
          <Toolkit />
        </div>
      </main>

      <Footer />
    </div>
  );
}
