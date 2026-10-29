import Dexie, { type Table } from 'dexie';
import type { ChatMessage, Extraction, Project, Task, TranscriptLog } from '../lib/types';

class HushDB extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  messages!: Table<ChatMessage, string>;
  transcripts!: Table<TranscriptLog, string>;
  extractions!: Table<Extraction, string>;

  constructor() {
    super('hush');
    this.version(1).stores({
      tasks: 'id, projectId, state, due, parentId, order, completedAt',
      projects: 'id, sortOrder, archived',
      messages: 'id, createdAt, taskId, role',
    });
    this.version(2).stores({
      tasks: 'id, projectId, state, due, parentId, order, completedAt, source, needsReview',
      projects: 'id, sortOrder, archived',
      messages: 'id, createdAt, taskId, role',
      transcripts: 'id, createdAt, taskId',
      extractions: 'id, status, source, createdAt',
    }).upgrade(async (tx) => {
      await tx.table('tasks').toCollection().modify((t: Task) => {
        if (!t.source) t.source = 'manual';
        if (t.sourceRef === undefined) t.sourceRef = null;
        if (t.confidence == null) t.confidence = 1;
        if (t.needsReview == null) t.needsReview = false;
      });
    });
  }
}

export const db = new HushDB();
