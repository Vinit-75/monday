import { nanoid } from 'nanoid';
import type { TaskStore } from '../core/interfaces';
import type { Task } from '../lib/types';
import { reminderTimes } from '../lib/reminders';
import { db } from './db';
import { syncReminders } from '../lib/notify';

const nowIso = () => new Date().toISOString();

function withReminders(task: Task): Task {
  if (!task.due || task.state === 'done') return { ...task, reminders: [] };
  return { ...task, reminders: reminderTimes(task.due) };
}

export const taskStore: TaskStore = {
  async add(input) {
    const t = nowIso();
    const task = withReminders({
      id: input.id ?? nanoid(10),
      title: input.title,
      notes: input.notes ?? '',
      projectId: input.projectId ?? null,
      tags: input.tags ?? [],
      priority: input.priority ?? 4,
      due: input.due ?? null,
      reminders: input.reminders ?? [],
      recurrence: input.recurrence ?? null,
      parentId: input.parentId ?? null,
      estimateMinutes: input.estimateMinutes ?? null,
      state: input.state ?? 'todo',
      agent: input.agent ?? null,
      order: Date.now(),
      createdAt: t,
      updatedAt: t,
      completedAt: input.completedAt ?? null,
      source: input.source ?? 'manual',
      sourceRef: input.sourceRef ?? null,
      confidence: input.confidence ?? 1,
      needsReview: input.needsReview ?? false,
    });
    await db.tasks.put(task);
    await syncReminders();
    return task;
  },

  async update(id, patch) {
    const existing = await db.tasks.get(id);
    if (!existing) return;
    const next = withReminders({ ...existing, ...patch, id, updatedAt: nowIso() });
    await db.tasks.put(next);
    await syncReminders();
  },

  async remove(id) {
    await db.tasks.delete(id);
    await syncReminders();
  },

  async get(id) {
    return db.tasks.get(id);
  },

  async all() {
    return db.tasks.toArray();
  },

  async complete(id) {
    await this.update(id, { state: 'done', completedAt: nowIso(), reminders: [] });
  },

  async snooze(id, until) {
    await this.update(id, { due: until.toISOString(), state: 'todo', completedAt: null });
  },
};
