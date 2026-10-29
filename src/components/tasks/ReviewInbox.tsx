import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { db } from '../../db/db';
import { taskStore } from '../../db/taskStore';
import { extractDeadlines } from '../../lib/extract';
import { fetchGoogleDeadlines } from '../../lib/google';
import { loadPublicSettings, tokenNeedsRefresh } from '../../lib/settings';
import { nanoid } from 'nanoid';
import { useState } from 'react';
import { useAppStore } from '../../stores/app';

export default function ReviewInbox() {
  const items = useLiveQuery(() => db.extractions.where('status').equals('pending').toArray(), []);
  const settings = useAppStore((s) => s.settings);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const expired = tokenNeedsRefresh(settings.googleSignedInAt);

  async function pull() {
    setBusy(true);
    setMsg('');
    try {
      const raw = await fetchGoogleDeadlines();
      if (raw.length === 0) {
        setMsg(loadPublicSettings().googleClientId ? 'Nothing new, or sign-in expired.' : 'Add a Google client ID in Settings first.');
        return;
      }
      const extracted = extractDeadlines(raw, loadPublicSettings().senderDomain);
      const existing = await db.extractions.toArray();
      const known = new Set(existing.map((e) => e.sourceRef));
      const fresh = extracted.filter((e) => !known.has(e.sourceRef));
      await db.extractions.bulkAdd(
        fresh.map((e) => ({
          id: nanoid(10),
          title: e.title,
          due: e.due,
          source: e.source,
          sourceRef: e.sourceRef,
          snippet: e.snippet,
          status: 'pending' as const,
          createdAt: new Date().toISOString(),
        })),
      );
      setMsg(fresh.length ? `${fresh.length} to review` : 'Caught up.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {expired && (
        <div className="rounded-xl bg-amber-200/10 px-3 py-2 text-sm text-amber-50 ring-1 ring-amber-200/25">
          Google access is about a week old. Re-sign in under Settings — testing-mode tokens expire weekly.
        </div>
      )}
      <div className="flex items-center gap-2">
        <button className="btn btn-primary !py-1.5 !px-3 text-xs" disabled={busy} onClick={pull}>
          {busy ? 'Reading…' : 'Pull Gmail and Calendar'}
        </button>
        {msg && <span className="mono text-[11px] text-[color:var(--text-faint)]">{msg}</span>}
      </div>
      {(items ?? []).length === 0 ? (
        <p className="text-sm text-[color:var(--text-faint)]">No extracted deadlines waiting. Pull mail and calendar, then accept or reject each one.</p>
      ) : (
        items!.map((e) => (
          <div key={e.id} className="rounded-xl bg-[color:var(--surface-raised)] px-3 py-3 ring-1 ring-[color:var(--border-soft)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm">{e.title}</div>
                <div className="mono mt-1 text-[10px] text-[color:var(--text-faint)]">
                  {e.source} · {e.due ? format(new Date(e.due), 'MMM d, p') : 'no time'} · {e.snippet}
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  className="btn btn-primary !py-1 !px-2 text-[11px]"
                  onClick={async () => {
                    await taskStore.add({
                      title: e.title,
                      notes: e.snippet,
                      projectId: null,
                      tags: [],
                      priority: 4,
                      due: e.due,
                      reminders: [],
                      recurrence: null,
                      parentId: null,
                      estimateMinutes: null,
                      state: 'todo',
                      agent: null,
                      completedAt: null,
                      source: e.source,
                      sourceRef: e.sourceRef,
                      confidence: 0.8,
                      needsReview: false,
                    });
                    await db.extractions.update(e.id, { status: 'accepted' });
                  }}
                >
                  Accept
                </button>
                <button className="btn btn-ghost !py-1 !px-2 text-[11px]" onClick={() => db.extractions.update(e.id, { status: 'rejected' })}>
                  Reject
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
