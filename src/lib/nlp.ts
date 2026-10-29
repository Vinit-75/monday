// Lightweight natural-language parser for quick-capture.
// Pulls out: #tags, !p1-!p4 priority, "tomorrow", "today", "fri", "5pm" dates.

import { addDays, nextFriday, nextMonday, nextSaturday, nextSunday, nextThursday, nextTuesday, nextWednesday, setHours, setMinutes } from 'date-fns';
import type { Priority } from './types';

export interface ParsedCapture {
  title: string;
  priority: Priority;
  due: string | null;
  tags: string[];
  projectHint: string | null;
}

const DAY_MAP: Record<string, (d: Date) => Date> = {
  mon: nextMonday, tue: nextTuesday, wed: nextWednesday,
  thu: nextThursday, fri: nextFriday, sat: nextSaturday, sun: nextSunday,
};

export function parseCapture(raw: string): ParsedCapture {
  let text = raw.trim();
  const tags: string[] = [];
  let projectHint: string | null = null;
  let priority: Priority = 4;
  let due: Date | null = null;

  // tags
  text = text.replace(/#(\w+)/g, (_, tag) => {
    tags.push(tag.toLowerCase());
    return '';
  });

  // project hint @project
  text = text.replace(/@(\w+)/g, (_, p) => {
    projectHint = p.toLowerCase();
    return '';
  });

  // priority !p1..!p4
  text = text.replace(/!p([1-4])/i, (_, p) => {
    priority = Number(p) as Priority;
    return '';
  });

  // date keywords
  const lower = text.toLowerCase();
  if (/\btoday\b/.test(lower)) { due = setDefaultTime(new Date()); text = text.replace(/\btoday\b/ig, ''); }
  else if (/\btomorrow\b/.test(lower)) { due = setDefaultTime(addDays(new Date(), 1)); text = text.replace(/\btomorrow\b/ig, ''); }
  else {
    for (const [key, fn] of Object.entries(DAY_MAP)) {
      const re = new RegExp(`\\b${key}(?:day)?\\b`, 'i');
      if (re.test(lower)) { due = setDefaultTime(fn(new Date())); text = text.replace(re, ''); break; }
    }
  }

  // time 5pm, 9:30am, 17:00
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch && due) {
    let h = parseInt(timeMatch[1], 10);
    const m = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = timeMatch[3]?.toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    if (h <= 23 && m <= 59) {
      due = setMinutes(setHours(due, h), m);
      text = text.replace(timeMatch[0], '');
    }
  }

  const title = text.replace(/\s+/g, ' ').trim() || raw.trim();
  return { title, priority, due: due ? due.toISOString() : null, tags, projectHint };
}

function setDefaultTime(d: Date): Date {
  return setMinutes(setHours(d, 17), 0);
}
