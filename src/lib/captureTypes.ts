import type { ParseIntent, Priority } from './types';

export interface ParsedCapture {
  title: string;
  priority: Priority;
  due: string | null;
  tags: string[];
  projectHint: string | null;
  confidence?: number;
  needsReview?: boolean;
  intent?: ParseIntent;
}
