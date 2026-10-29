import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/app';
import { taskStore } from '../../db/taskStore';
import { db } from '../../db/db';
import { nanoid } from 'nanoid';

export default function ConfirmCard() {
  const pending = useAppStore((s) => s.pending);
  const transcript = useAppStore((s) => s.pendingTranscript);
  const setPending = useAppStore((s) => s.setPending);
  const activeList = useAppStore((s) => s.activeList);
  const language = useAppStore((s) => s.settings.language);
  const [title, setTitle] = useState('');
  const [dueLocal, setDueLocal] = useState('');
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!pending) return;
    setTitle(pending.title);
    setDueLocal(toLocal(pending.due));
    setEditing(false);
  }, [pending]);

  if (!pending || pending.intent !== 'add') return null;

  async function save() {
    const projectId = typeof activeList === 'object' ? activeList.id : null;
    const due = dueLocal ? new Date(dueLocal).toISOString() : null;
    const task = await taskStore.add({
      title: title.trim() || pending!.title || transcript,
      notes: '',
      projectId,
      tags: [],
      priority: 4,
      due,
      reminders: [],
      recurrence: null,
      parentId: null,
      estimateMinutes: null,
      state: 'todo',
      agent: null,
      completedAt: null,
      source: 'voice',
      sourceRef: null,
      confidence: pending!.confidence,
      needsReview: pending!.needsReview,
    });
    await db.transcripts.add({
      id: nanoid(8),
      raw: transcript,
      corrected: task.title,
      lang: language,
      createdAt: new Date().toISOString(),
      taskId: task.id,
    });
    setPending(null);
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4" onClick={() => setPending(null)}>
      <div className="glass-strong w-full max-w-md rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mono text-[10px] text-[color:var(--text-faint)]">Confirm before saving</div>
        {pending.needsReview && (
          <div className="mt-2 inline-flex rounded-full bg-amber-200/15 px-2 py-0.5 text-[11px] text-amber-100 ring-1 ring-amber-200/30">
            needs review
          </div>
        )}
        {editing ? (
          <div className="mt-3 space-y-2">
            <input className="w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input type="datetime-local" className="w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none" value={dueLocal} onChange={(e) => setDueLocal(e.target.value)} />
          </div>
        ) : (
          <div className="mt-3">
            <div className="display text-2xl leading-tight">{title || 'Untitled'}</div>
            <div className="mono mt-1 text-xs text-[color:var(--text-mute)]">
              {dueLocal ? format(new Date(dueLocal), 'EEE d MMM, p') : 'No time set'}
            </div>
          </div>
        )}
        {transcript && (
          <p className="mt-3 text-[12px] text-[color:var(--text-faint)]">Heard: {transcript}</p>
        )}
        <div className="mt-5 flex gap-2">
          <button className="btn btn-primary !py-2 !px-4 text-xs" onClick={save}>Save</button>
          <button className="btn btn-ghost !py-2 !px-4 text-xs" onClick={() => setEditing((v) => !v)}>{editing ? 'Preview' : 'Edit'}</button>
          <button className="btn btn-ghost !py-2 !px-4 text-xs ml-auto" onClick={() => setPending(null)}>Dismiss</button>
        </div>
      </div>
    </div>
  );
}

function toLocal(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
