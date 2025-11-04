import React, { useEffect, useMemo, useState } from 'react';
import Hero from './components/Hero';
import Features from './components/Features';
import Toolkit from './components/Toolkit';
import Footer from './components/Footer';
import FileDrop from './components/FileDrop';
import ChatBox from './components/ChatBox';
import PreviewPane from './components/PreviewPane';
import Suggestions from './components/Suggestions';
import { Flame } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]); // full resource support
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [suggestions, setSuggestions] = useState([]);

  // simple simulated processing
  useEffect(() => {
    if (!working) return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        const next = Math.min(100, p + Math.ceil(Math.random() * 12));
        if (next >= 100) {
          clearInterval(id);
          setWorking(false);
        }
        return next;
      });
    }, 300);
    return () => clearInterval(id);
  }, [working]);

  const handleFilesLoad = (incoming) => {
    setFiles(incoming);
    // try to auto-select a relevant file
    const preferred = ['fxmanifest.lua', 'config.lua', 'server/', 'client/'];
    const idx = incoming.findIndex((f) => preferred.some((p) => f.path.toLowerCase().includes(p)));
    setSelectedIndex(idx >= 0 ? idx : 0);
    setWorking(true);

    // build suggestions across files
    const lc = incoming.map((f) => f.content?.toLowerCase() || '').join('\n');
    const sugg = [];
    if (lc.includes('registernetevent')) {
      sugg.push({ title: 'Validate RegisterNetEvent sources', desc: 'Ensure source checks on server and sanitize client payloads.' });
    }
    if (lc.includes('esx')) {
      sugg.push({ title: 'Offer ESX → ox_lib context', desc: 'Replace legacy ESX menus with ox_lib context menus and callbacks.' });
    }
    if (lc.includes('createthread') || lc.includes('while true do')) {
      sugg.push({ title: 'Consolidate threads', desc: 'Debounce heavy loops and use proper Wait times to reduce CPU usage.' });
    }
    if (!sugg.length) {
      sugg.push({ title: 'Add README and config', desc: 'Generate configuration file and documentation for easier release.' });
    }
    setSuggestions(sugg);
  };

  const handleAsk = (question, replyCb) => {
    setWorking(true);
    const activeFile = files[selectedIndex]?.path || 'your resource';
    const baseReply = `Got it. I will analyze ${activeFile} and the rest of the resource for optimization, security, and framework best practices.`;
    setTimeout(() => replyCb(baseReply), 400);
    setTimeout(() => replyCb('Tip: prefer ox_lib callbacks for client→server interactions and validate identifiers on the server.'), 1200);
  };

  const suggestionItems = useMemo(() => suggestions.map((s) => ({ ...s })), [suggestions]);

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
            <a href="#analyzer" className="hover:text-white">Analyzer</a>
            <a href="#toolkit" className="hover:text-white">Toolkit</a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-6 md:space-y-10">
        <Hero />

        {/* Analyzer Section */}
        <section id="analyzer" className="grid lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4">
            <FileDrop onFilesLoad={handleFilesLoad} />
            <PreviewPane
              working={working}
              progress={progress}
              files={files}
              selectedIndex={selectedIndex}
              onSelect={setSelectedIndex}
            />
          </div>
          <div className="lg:col-span-1 space-y-4">
            <ChatBox onAsk={handleAsk} isWorking={working} />
            <Suggestions items={suggestionItems} />
          </div>
        </section>

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
