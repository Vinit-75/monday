import type { ParseResult, SpeechLang, SpeechResult, Task } from '../lib/types';

export interface TaskStore {
  add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { id?: string }): Promise<Task>;
  update(id: string, patch: Partial<Task>): Promise<void>;
  remove(id: string): Promise<void>;
  get(id: string): Promise<Task | undefined>;
  all(): Promise<Task[]>;
  complete(id: string): Promise<void>;
  snooze(id: string, until: Date): Promise<void>;
}

export interface SpeechInput {
  start(lang: SpeechLang): Promise<void>;
  stop(): Promise<SpeechResult>;
  abort(): void;
}

export interface LlmClient {
  parseAmbiguous(text: string, now: Date, tz: string): Promise<ParseResult | null>;
  transcribe(audio: Blob, lang: SpeechLang): Promise<string | null>;
  generate(prompt: string): Promise<string | null>;
}
