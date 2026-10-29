export type Priority = 1 | 2 | 3 | 4;
export type TaskState =
  | 'todo'
  | 'doing'
  | 'done'
  | 'agent_working'
  | 'needs_you'
  | 'blocked';

export type TaskSource = 'manual' | 'voice' | 'email' | 'calendar';
export type SpeechLang = 'auto' | 'en' | 'hi';
export type ParseIntent = 'add' | 'query_week' | 'complete' | 'unknown';

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
  source: TaskSource;
  sourceRef: string | null;
  confidence: number;
  needsReview: boolean;
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

export interface TranscriptLog {
  id: string;
  raw: string;
  corrected: string;
  lang: string;
  createdAt: string;
  taskId: string | null;
}

export interface Extraction {
  id: string;
  title: string;
  due: string | null;
  source: 'email' | 'calendar';
  sourceRef: string;
  snippet: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export type ViewMode = 'list' | 'board' | 'calendar';
export type SmartList = 'today' | 'inbox' | 'upcoming' | 'someday' | 'completed' | 'review';

export interface ParseResult {
  intent: ParseIntent;
  title: string;
  due: Date | null;
  confidence: number;
  needsReview: boolean;
  completeQuery?: string;
  raw: string;
}

export interface SpeechResult {
  transcript: string;
  confidence: number;
  lang: string;
  audio: Blob | null;
}
