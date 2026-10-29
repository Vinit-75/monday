import { parseUtterance } from './parser';
import type { ParsedCapture } from './captureTypes';
import type { Priority } from './types';

export type { ParsedCapture } from './captureTypes';

export function parseCapture(raw: string): ParsedCapture {
  let text = raw.trim();
  const tags: string[] = [];
  let projectHint: string | null = null;
  let priority: Priority = 4;

  text = text.replace(/#(\w+)/g, (_, tag) => {
    tags.push(tag.toLowerCase());
    return '';
  });
  text = text.replace(/@(\w+)/g, (_, p) => {
    projectHint = p.toLowerCase();
    return '';
  });
  text = text.replace(/!p([1-4])/i, (_, p) => {
    priority = Number(p) as Priority;
    return '';
  });

  const parsed = parseUtterance(text);
  return {
    title: parsed.title,
    priority,
    due: parsed.due ? parsed.due.toISOString() : null,
    tags,
    projectHint,
    confidence: parsed.confidence,
    needsReview: parsed.needsReview,
    intent: parsed.intent,
  };
}
