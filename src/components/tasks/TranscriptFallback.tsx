import { useState } from 'react';
import { parseUtterance } from '../../lib/parser';
import { useAppStore } from '../../stores/app';

export default function TranscriptFallback({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const setPending = useAppStore((s) => s.setPending);
  const [text, setText] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4" onClick={onClose}>
      <div className="glass-strong w-full max-w-md rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="display text-2xl">Type what you said</div>
        <p className="mt-1 text-sm text-[color:var(--text-mute)]">Recognition did not catch that. Edit the transcript, then continue.</p>
        <textarea
          autoFocus
          className="mt-3 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none"
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Submit DBMS assignment Friday 11:59 pm"
        />
        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-primary !py-2 !px-4 text-xs"
            disabled={!text.trim()}
            onClick={() => {
              const parsed = parseUtterance(text.trim());
              setPending(parsed, text.trim());
              setText('');
              onClose();
            }}
          >
            Continue
          </button>
          <button className="btn btn-ghost !py-2 !px-4 text-xs" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
