import React, { useEffect, useRef, useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';

export default function ChatBox({ onAsk, isWorking }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Drop a script or ask for optimization tips. I can suggest improvements, security checks, and conversion paths.' },
  ]);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const newMsgs = [...messages, { role: 'user', content: text }];
    setMessages(newMsgs);
    setInput('');
    onAsk?.(text, (reply) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    });
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={"flex gap-3 " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
            {m.role === 'assistant' && (
              <div className="shrink-0 h-8 w-8 grid place-items-center rounded-full bg-indigo-500/20 ring-1 ring-indigo-400/30">
                <Bot className="h-4 w-4 text-indigo-300" />
              </div>
            )}
            <div className={
              'max-w-[75%] rounded-xl px-3 py-2 text-sm ' +
              (m.role === 'user' ? 'bg-indigo-500/20 ring-1 ring-indigo-400/30' : 'bg-black/40 ring-1 ring-white/10')
            }>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="shrink-0 h-8 w-8 grid place-items-center rounded-full bg-white/10 ring-1 ring-white/20">
                <User className="h-4 w-4 text-white/80" />
              </div>
            )}
          </div>
        ))}
        {isWorking && (
          <div className="flex items-center gap-2 text-xs text-white/60"><Loader2 className="h-3.5 w-3.5 animate-spin"/> Analyzing...</div>
        )}
        <div ref={endRef} />
      </div>
      <div className="border-t border-white/10 p-3 flex items-center gap-2 bg-black/20">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask for optimization, conversion, or security tips..."
          className="flex-1 bg-transparent outline-none text-sm placeholder-white/40"
        />
        <button onClick={send} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 text-sm">
          <Send className="h-4 w-4" /> Send
        </button>
      </div>
    </div>
  );
}
