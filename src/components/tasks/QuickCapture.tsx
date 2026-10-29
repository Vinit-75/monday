import { useEffect, useRef, useState } from 'react';
import { Mic, SendHorizontal } from 'lucide-react';
import { useAppStore } from '../../stores/app';
import { agent } from '../../ai/agent';
import { parseCapture } from '../../lib/nlp';
import { format } from 'date-fns';
import clsx from 'clsx';
import { usePushToTalk } from '../../hooks/usePushToTalk';
import TranscriptFallback from './TranscriptFallback';

export default function QuickCapture() {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const quickCaptureFocused = useAppStore((s) => s.quickCaptureFocused);
  const blurQuickCapture = useAppStore((s) => s.blurQuickCapture);
  const activeList = useAppStore((s) => s.activeList);
  const language = useAppStore((s) => s.settings.language);
  const parsed = text.trim() ? parseCapture(text) : null;
  const ptt = usePushToTalk();

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
    await agent.captureFromText(t, projectHint, 'manual');
    setText('');
  }

  return (
    <div>
      <div className="glass-strong flex items-center gap-2 rounded-2xl px-3 py-2.5">
        <button
          onClick={() => ptt.toggle()}
          className={clsx(
            'relative grid h-9 w-9 shrink-0 place-items-center rounded-full border transition',
            ptt.listening
              ? 'bg-amber-200/20 border-amber-200/50 text-amber-100'
              : 'bg-[color:var(--surface-raised)] border-[color:var(--border-soft)] hover:border-[color:var(--border-ring)]',
          )}
          aria-label="Push to talk"
        >
          {ptt.listening && <span className="agent-ring rounded-full" />}
          <Mic size={14} />
        </button>
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
          placeholder="Type a deadline — or hold the mic. Try ‘submit DBMS friday 11:59’"
          className="min-w-0 flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-[color:var(--text-faint)]"
        />
        {parsed && (parsed.due || parsed.tags.length) && (
          <div className="hidden items-center gap-1 md:flex">
            {parsed.due && <span className="chip">{format(new Date(parsed.due), 'MMM d, p')}</span>}
            {parsed.needsReview && <span className="chip !text-amber-100">review</span>}
            {parsed.tags.map((t) => <span key={t} className="chip">#{t}</span>)}
          </div>
        )}
        <span className="mono hidden text-[10px] text-[color:var(--text-faint)] sm:inline">{language}</span>
        <button
          onClick={submit}
          disabled={!text.trim()}
          className="btn btn-primary !py-1.5 !px-3 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <SendHorizontal size={13} />
        </button>
      </div>
      {ptt.notice && (
        <div className="mt-2 rounded-xl bg-[color:var(--surface-raised)] px-3 py-2 text-sm">
          {ptt.notice}
        </div>
      )}
      <TranscriptFallback open={ptt.needTranscript} onClose={() => ptt.setNeedTranscript(false)} />
    </div>
  );
}
