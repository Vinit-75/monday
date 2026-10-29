export type Priority = 1 | 2 | 3 | 4;
export type TaskState =
  | 'todo'
  | 'doing'
  | 'done'
  | 'agent_working'
  | 'needs_you'
  | 'blocked';

export interface AgentContext {
  status: 'idle' | 'working' | 'done' | 'needs_you';
  lastMessage: string;
  output: string | null;
  startedAt: string;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  projectId: string | null;
  tags: string[];
  priority: Priority;
  due: string | null;
  reminders: string[];
  recurrence: string | null;
  parentId: string | null;
  estimateMinutes: number | null;
  state: TaskState;
  agent: AgentContext | null;
  order: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface Project {
  id: string;
  name: string;
  emoji: string;
  color: string;
  archived: boolean;
  sortOrder: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent' | 'system';
  text: string;
  createdAt: string;
  taskId?: string;
}

export type ViewMode = 'list' | 'board' | 'calendar';
export type SmartList = 'today' | 'inbox' | 'upcoming' | 'someday' | 'completed';
