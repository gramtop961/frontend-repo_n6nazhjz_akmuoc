import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export default function FlamesBlueChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        '🔥 Hey there, I’m FlamesBlue AI — your FiveM dev assistant! Paste a script or ask me anything about ESX, ox_lib, or optimization.',
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;
    const userMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    const base = import.meta.env.VITE_BACKEND_URL || '';

    try {
      // Attempt backend call if available; otherwise gracefully fallback
      const res = await fetch(`${base}/api/flamesblue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      if (!res.ok) throw new Error('No backend');
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      // Local mock response for sandbox preview
      const reply =
        "Alright — I don't see a backend connected yet, so here’s a quick local analysis. \n\n• Use ox_lib callbacks for client → server.\n• Validate source on server events.\n• Prefer cached coords and consolidated threads.\n\nPaste code and I’ll annotate it inline. 🚀";
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="chat" className="relative w-full h-[560px] md:h-[640px] bg-[#0f1115] rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex flex-col h-full text-gray-100">
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-[#11131a]">
          <h3 className="text-sm font-medium">FlamesBlue Chat</h3>
          <span className="text-xs text-white/60">FiveM • ESX • ox_lib</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`p-3 rounded-2xl max-w-[85%] ${
                msg.role === 'assistant' ? 'bg-blue-900/30 self-start' : 'bg-gray-700/50 self-end'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{msg.content}</pre>
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="flex p-3 bg-[#11131a] border-t border-white/10">
          <input
            className="flex-1 bg-transparent border-none outline-none px-3 text-sm text-gray-200"
            placeholder="Type your FiveM code or question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={sending}
          />
          <button
            className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition"
            onClick={sendMessage}
            disabled={sending}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
