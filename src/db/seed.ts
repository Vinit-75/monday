import { db } from './db';
import type { Project, Task } from '../lib/types';

const now = () => new Date().toISOString();
const inDays = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(17, 0, 0, 0);
  return d.toISOString();
};

let seedingPromise: Promise<void> | null = null;

export async function ensureSeed() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    const existing = await db.projects.count();
    if (existing > 0) return;
    await doSeed();
  })();
  return seedingPromise;
}

async function doSeed() {
  const projects: Project[] = [
    { id: 'p-personal', name: 'Personal', emoji: '🌱', color: '#aed98c', archived: false, sortOrder: 0 },
    { id: 'p-work', name: 'Work', emoji: '💼', color: '#9191ff', archived: false, sortOrder: 1 },
    { id: 'p-home', name: 'Home', emoji: '🏡', color: '#ffd8a8', archived: false, sortOrder: 2 },
    { id: 'p-ideas', name: 'Ideas', emoji: '✨', color: '#79bfff', archived: false, sortOrder: 3 },
  ];
  await db.projects.bulkPut(projects);

  // Deterministic IDs so StrictMode double-fire is idempotent
  const tasks: Task[] = [
    seed('seed-welcome', 'Welcome to Hush — tap the mic to talk to your agent', null, 2, inDays(0)),
    { ...seed('seed-qreview', 'Draft the quarterly review doc', 'p-work', 1, inDays(0)),
      state: 'agent_working',
      agent: { status: 'working', lastMessage: 'Reading last quarter’s notes…', output: null, startedAt: now() } },
    seed('seed-mom', 'Call mom', 'p-personal', 2, inDays(0)),
    { ...seed('seed-thai', 'Book a Thai spot for Friday — somewhere quiet', 'p-personal', 3, inDays(2)),
      state: 'needs_you',
      agent: { status: 'needs_you', lastMessage: 'Picked 3 options under 15 min walk. Which one?', output: 'Soi 38 · Pok Pok · Night + Market — all within a 15-min walk. Soi 38 is quietest.', startedAt: now() } },
    seed('seed-bulb', 'Replace the kitchen bulb', 'p-home', 4, inDays(1)),
    seed('seed-priya', 'Reply to Priya about Thursday', 'p-work', 2, inDays(1)),
    seed('seed-lindy', 'Read the Lindy paper and summarize', 'p-ideas', 3, inDays(4)),
    seed('seed-hike', 'Plan weekend hike route', 'p-personal', 3, inDays(3)),
    seed('seed-audit', 'Audit the landing page copy', 'p-work', 2, inDays(2)),
    seed('seed-plants', 'Water the plants', 'p-home', 4, inDays(0)),
  ];
  await db.tasks.bulkPut(tasks);
}

function seed(id: string, title: string, projectId: string | null, priority: 1 | 2 | 3 | 4, due: string): Task {
  const t = now();
  return {
    id, title, notes: '', projectId, tags: [], priority, due,
    reminders: [], recurrence: null, parentId: null, estimateMinutes: null,
    state: 'todo', agent: null, order: 0,
    createdAt: t, updatedAt: t, completedAt: null,
  };
}

export async function wipeAndReseed() {
  await db.tasks.clear();
  await db.projects.clear();
  await db.messages.clear();
  seedingPromise = null;
  await ensureSeed();
}
