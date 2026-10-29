import { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useAppStore } from '../../stores/app';
import { db } from '../../db/db';
import { ArrowRight, Calendar, Inbox, Sparkles, Moon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function CommandPalette() {
  const open = useAppStore((s) => s.commandOpen);
  const setOpen = useAppStore((s) => s.setCommandOpen);
  const setActiveList = useAppStore((s) => s.setActiveList);
  const toggleTheme = useAppStore((s) => s.toggleTheme);
  const toggleAgent = useAppStore((s) => s.toggleAgent);
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  useEffect(() => {
    if (open) {
      setQ(''); setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const items = [
    { id: 'today', label: 'Go to Today', icon: Sparkles, run: () => setActiveList('today') },
    { id: 'inbox', label: 'Go to Inbox', icon: Inbox, run: () => setActiveList('inbox') },
    { id: 'upcoming', label: 'Go to Upcoming', icon: Calendar, run: () => setActiveList('upcoming') },
    { id: 'someday', label: 'Go to Someday', icon: Moon, run: () => setActiveList('someday') },
    { id: 'completed', label: 'Go to Completed', icon: CheckCircle2, run: () => setActiveList('completed') },
    { id: 'theme', label: 'Toggle theme', icon: Moon, run: toggleTheme },
    { id: 'agent', label: 'Toggle agent dock', icon: Sparkles, run: toggleAgent },
    ...(projects?.map((p) => ({ id: p.id, label: `Open ${p.name}`, icon: ArrowRight, run: () => setActiveList({ kind: 'project', id: p.id }) })) ?? []),
  ].filter((it) => it.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-start bg-black/40 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong w-[520px] max-w-[90vw] rounded-2xl p-2"
          >
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => { setQ(e.target.value); setIdx(0); }}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setOpen(false);
                if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((v) => Math.min(items.length - 1, v + 1)); }
                if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((v) => Math.max(0, v - 1)); }
                if (e.key === 'Enter' && items[idx]) { items[idx].run(); setOpen(false); }
              }}
              placeholder="Type a command or search…"
              className="w-full rounded-xl bg-transparent px-3 py-3 text-sm outline-none placeholder:text-[color:var(--text-faint)]"
            />
            <div className="max-h-[320px] overflow-y-auto">
              {items.map((it, i) => (
                <button
                  key={it.id}
                  onClick={() => { it.run(); setOpen(false); }}
                  onMouseEnter={() => setIdx(i)}
                  className={clsx(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm',
                    i === idx ? 'bg-[color:var(--surface-raised)]' : 'hover:bg-[color:var(--surface-raised)]/60'
                  )}
                >
                  <it.icon size={14} className="opacity-60" />
                  <span>{it.label}</span>
                </button>
              ))}
              {items.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-[color:var(--text-faint)]">
                  Nothing matches.
                </div>
              )}
            </div>
            <div className="mono mt-1 flex items-center justify-between border-t border-[color:var(--border-soft)] px-3 py-2 text-[10px] text-[color:var(--text-faint)]">
              <span>↑ ↓ to move · ↵ to select</span>
              <span>esc to close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
