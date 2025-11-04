import React from 'react';
import TopNav from './components/TopNav';
import Hero from './components/Hero';
import NUITester from './components/NUITester';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0D14] text-white">
      <TopNav />
      <main className="mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8 md:space-y-12">
        <Hero />
        <NUITester />
      </main>
      <Footer />
    </div>
  );
}
