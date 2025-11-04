import React from 'react';
import Spline from '@splinetool/react-spline';
import { Rocket, Shield, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative isolate">
      {/* 3D scene block */}
      <div className="relative w-full h-[520px] md:h-[640px] rounded-2xl overflow-hidden ring-1 ring-white/10">
        <Spline
          scene="https://prod.spline.design/4cHQr84zOGAHOehh/scene.splinecode"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Soft gradient overlays that do not block interaction */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_40%,rgba(99,102,241,0.25),transparent)]" />
      </div>

      {/* Content lives below the canvas to prevent overlap issues */}
      <div className="mx-auto max-w-6xl px-4 mt-6 md:mt-8">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
          FlamesBlue AI DevTools
        </h1>
        <p className="mt-3 md:mt-4 text-sm md:text-base text-white/70 max-w-2xl">
          Advanced FiveM script assistant for ESX, ox_lib, and modern resource optimization.
          Analyze, optimize, and generate production-ready scripts with confidence.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-white/80">Performance-first optimization</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="text-sm text-white/80">Security & exploit checks</span>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3 ring-1 ring-white/10">
            <Rocket className="h-5 w-5 text-indigo-400" />
            <span className="text-sm text-white/80">Ready for release & Tebex</span>
          </div>
        </div>
      </div>
    </section>
  );
}
