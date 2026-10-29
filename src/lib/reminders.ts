const OFFSETS_MS = [
  { id: '3d', ms: 3 * 24 * 60 * 60 * 1000 },
  { id: '1d', ms: 24 * 60 * 60 * 1000 },
  { id: '3h', ms: 3 * 60 * 60 * 1000 },
] as const;

export function reminderTimes(dueIso: string, now = new Date()): string[] {
  const due = new Date(dueIso).getTime();
  const nowMs = now.getTime();
  return OFFSETS_MS
    .map((o) => due - o.ms)
    .filter((t) => t > nowMs)
    .map((t) => new Date(t).toISOString());
}

export function snoozeBy(dueIso: string | null, hours: number, now = new Date()): Date {
  const base = dueIso ? new Date(dueIso) : now;
  const next = new Date(Math.max(base.getTime(), now.getTime()) + hours * 60 * 60 * 1000);
  return next;
}

export function snoozeTomorrowMorning(now = new Date()): Date {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  return d;
}
