import { useEffect, useRef, useState } from 'react';
import { Mic, SendHorizontal, Sparkles } from 'lucide-react';
import { useAppStore } from '../../stores/app';
import { agent } from '../../ai/agent';
import { parseCapture } from '../../lib/nlp';
import { format } from 'date-fns';
import clsx from 'clsx';

export default function QuickCapture() {
  const [text, setText] = useState('');
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const quickCaptureFocused = useAppStore((s) => s.quickCaptureFocused);
  const blurQuickCapture = useAppStore((s) => s.blurQuickCapture);
  const activeList = useAppStore((s) => s.activeList);
  const parsed = text.trim() ? parseCapture(text) : null;

  useEffect(() => {
    if (quickCaptureFocused) {
      inputRef.current?.focus();
      blurQuickCapture();
    }
  }, [quickCaptureFocused, blurQuickCapture]);

  async function submit() {
    const t = text.trim();
    if (!t) return;
    const projectHint = typeof activeList === 'object' && activeList.kind === 'project' ? activeList.id : null;
    await agent.captureFromText(t, projectHint);
    setText('');
  }

  function toggleMic() {
    setListening((v) => !v);
    // Stub: we flash the state. Real Web Speech wiring lives behind this.
    setTimeout(() => {
      if (!document.hidden) {
        setText((prev) => prev || 'Remind me to breathe deeply at 3pm');
        setListening(false);
      }
    }, 1600);
  }

  return (
    <div className="glass-strong flex items-center gap-2 rounded-2xl px-3 py-2.5">
      <button
        onClick={toggleMic}
        className={clsx(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-full border transition',
          listening
            ? 'bg-amber-200/20 border-amber-200/50 text-amber-100'
            : 'bg-[color:var(--surface-raised)] border-[color:var(--border-soft)] hover:border-[color:var(--border-ring)]'
        )}
        aria-label="Voice capture"
      >
        {listening && <span className="agent-ring rounded-full" />}
        <Mic size={14} />
      </button>
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
        placeholder="Just say what's on your mind — or type it. Try 'call mom tomorrow 5pm #personal !p2'"
        className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-[color:var(--text-faint)]"
      />
      {parsed && (parsed.priority < 4 || parsed.due || parsed.tags.length) && (
        <div className="hidden items-center gap-1 md:flex">
          {parsed.priority < 4 && <span className="chip !text-amber-100 !border-amber-100/30 !bg-amber-100/10">P{parsed.priority}</span>}
          {parsed.due && <span className="chip">{format(new Date(parsed.due), 'MMM d, p')}</span>}
          {parsed.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
        </div>
      )}
      <button className="btn btn-ghost !py-1.5 !px-3 text-xs" onClick={() => setText((v) => v + ' !p2')}>
        <Sparkles size={13} /> Hint
      </button>
      <button
        onClick={submit}
        disabled={!text.trim()}
        className="btn btn-primary !py-1.5 !px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <SendHorizontal size={13} />
      </button>
    </div>
  );
}
