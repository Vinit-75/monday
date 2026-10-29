import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Mic, SendHorizontal, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { db } from '../../db/db';
import { sendChat } from '../../ai/agent';
import { useAppStore } from '../../stores/app';
import { format } from 'date-fns';

export default function AgentDock() {
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [listening, setListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const setOpen = useAppStore((s) => s.setAgentOpen);

  const messages = useLiveQuery(() => db.messages.orderBy('createdAt').toArray(), []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages?.length, thinking]);

  useEffect(() => {
    (async () => {
      const existing = await db.messages.get('seed-welcome');
      if (existing) return;
      await db.messages.put({
        id: 'seed-welcome',
        role: 'agent',
        text: "I'm here when you need me. Tap the mic and tell me what's on your plate — I'll take anything I can.",
        createdAt: new Date().toISOString(),
      });
    })();
  }, []);

  async function send() {
    const t = input.trim(); if (!t) return;
    setInput(''); setThinking(true);
    await sendChat(t);
    setThinking(false);
  }

  function toggleMic() {
    setListening((v) => !v);
    setTimeout(() => {
      setInput((p) => p || 'Plan my day');
      setListening(false);
    }, 1500);
  }

  const suggestions = ['Plan my day', 'Research the Thai spot', 'Draft the reply to Priya', 'What should I do first?'];

  return (
    <motion.aside
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 220, damping: 28 }}
      className="glass flex h-full w-[360px] shrink-0 flex-col rounded-[20px] overflow-hidden"
    >
      <header className="flex items-center justify-between border-b border-[color:var(--border-soft)] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="relative grid h-7 w-7 place-items-center rounded-full bg-amber-200/15 ring-1 ring-amber-200/40">
            <Sparkles size={13} className="text-amber-100" />
          </div>
          <div>
            <div className="text-sm font-medium">Agent</div>
            <div className="mono text-[10px] text-[color:var(--text-faint)]">1-to-1 · stubbed demo</div>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="grid h-7 w-7 place-items-center rounded-md hover:bg-[color:var(--surface-raised)]">
          <X size={13} />
        </button>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        <AnimatePresence initial={false}>
          {messages?.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <div
                className={clsx(
                  'max-w-[82%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed',
                  m.role === 'user'
                    ? 'bg-brand-primary/80 text-white'
                    : 'bg-[color:var(--surface-raised)] text-[color:var(--text)] ring-1 ring-[color:var(--border-soft)]'
                )}
              >
                {m.text}
                <div className="mono mt-1 text-[9px] opacity-50">{format(new Date(m.createdAt), 'p')}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {thinking && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-[color:var(--surface-raised)] px-3 py-2 ring-1 ring-[color:var(--border-soft)]">
              <div className="flex gap-1 py-1">
                <Dot /><Dot delay={0.15} /><Dot delay={0.3} />
              </div>
            </div>
          </div>
        )}
      </div>

      {messages && messages.length < 3 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); setTimeout(send, 50); }}
              className="chip hover:border-[color:var(--border-ring)]"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-[color:var(--border-soft)] p-3">
        <div className="flex items-center gap-2 rounded-full bg-[color:var(--surface-raised)] p-1 ring-1 ring-[color:var(--border-soft)]">
          <button
            onClick={toggleMic}
            className={clsx(
              'relative grid h-9 w-9 shrink-0 place-items-center rounded-full transition',
              listening
                ? 'bg-amber-200/25 text-amber-100'
                : 'bg-[color:var(--surface-strong)] hover:bg-black/40'
            )}
            aria-label="Voice"
          >
            {listening && <span className="agent-ring rounded-full" />}
            <Mic size={14} />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
            placeholder="Ask, or just say it…"
            className="flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-[color:var(--text-faint)]"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="grid h-8 w-8 place-items-center rounded-full bg-brand-primary text-white disabled:opacity-30"
            aria-label="Send"
          >
            <SendHorizontal size={13} />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}

function Dot({ delay = 0 }: { delay?: number }) {
  return (
    <motion.span
      animate={{ opacity: [0.3, 1, 0.3], y: [0, -2, 0] }}
      transition={{ duration: 1, repeat: Infinity, delay }}
      className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--text-mute)]"
    />
  );
}
