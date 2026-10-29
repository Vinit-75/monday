import { useLiveQuery } from 'dexie-react-hooks';
import { useEffect, useState } from 'react';
import { db } from '../../db/db';
import { taskStore } from '../../db/taskStore';
import { useAppStore } from '../../stores/app';

export default function TaskEditor() {
  const id = useAppStore((s) => s.editingId);
  const setEditingId = useAppStore((s) => s.setEditingId);
  const task = useLiveQuery(() => (id ? db.tasks.get(id) : undefined), [id]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!task) return;
    setTitle(task.title);
    setDue(toLocal(task.due));
    setNotes(task.notes);
  }, [task]);

  if (!id || !task) return null;

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4" onClick={() => setEditingId(null)}>
      <div className="glass-strong w-full max-w-md rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mono text-[10px] text-[color:var(--text-faint)]">Edit task</div>
        <input className="mt-3 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="datetime-local" className="mt-2 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none" value={due} onChange={(e) => setDue(e.target.value)} />
        <textarea className="mt-2 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" />
        <div className="mt-4 flex gap-2">
          <button
            className="btn btn-primary !py-2 !px-4 text-xs"
            onClick={async () => {
              await taskStore.update(id, {
                title: title.trim() || task.title,
                due: due ? new Date(due).toISOString() : null,
                notes,
              });
              setEditingId(null);
            }}
          >
            Save
          </button>
          <button className="btn btn-ghost !py-2 !px-4 text-xs" onClick={() => setEditingId(null)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function toLocal(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
