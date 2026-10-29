import Dexie, { type Table } from 'dexie';
import type { Task, Project, ChatMessage } from '../lib/types';

class HushDB extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  messages!: Table<ChatMessage, string>;

  constructor() {
    super('hush');
    this.version(1).stores({
      tasks: 'id, projectId, state, due, parentId, order, completedAt',
      projects: 'id, sortOrder, archived',
      messages: 'id, createdAt, taskId, role',
    });
  }
}

export const db = new HushDB();
