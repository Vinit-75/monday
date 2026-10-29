import { db } from './db';
import type { Project } from '../lib/types';

const DEMO_TASKS = [
  'seed-welcome', 'seed-qreview', 'seed-mom', 'seed-thai', 'seed-bulb',
  'seed-priya', 'seed-lindy', 'seed-hike', 'seed-audit', 'seed-plants',
];

let seedingPromise: Promise<void> | null = null;

export async function ensureSeed() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = (async () => {
    await db.tasks.bulkDelete(DEMO_TASKS);
    await db.messages.delete('seed-welcome');
    const existing = await db.projects.count();
    if (existing > 0) return;
    await db.projects.bulkPut([
      { id: 'p-personal', name: 'Personal', emoji: '🌱', color: '#aed98c', archived: false, sortOrder: 0 },
      { id: 'p-work', name: 'Work', emoji: '💼', color: '#9191ff', archived: false, sortOrder: 1 },
      { id: 'p-home', name: 'Home', emoji: '🏡', color: '#ffd8a8', archived: false, sortOrder: 2 },
      { id: 'p-uni', name: 'University', emoji: '🎓', color: '#79bfff', archived: false, sortOrder: 3 },
    ] satisfies Project[]);
  })();
  return seedingPromise;
}
