import { describe, expect, it } from 'vitest';
import { groupDeadlines, parseUtterance } from './parser';
import { extractDeadlines } from './extract';
import { reminderTimes, snoozeTomorrowMorning } from './reminders';

const NOW = new Date(2026, 9, 30, 10, 0, 0);

describe('parseUtterance', () => {
  it('parses English relative dates against the given clock', () => {
    const r = parseUtterance('Submit DBMS assignment tomorrow 11:59 pm', NOW);
    expect(r.intent).toBe('add');
    expect(r.title.toLowerCase()).toContain('dbms');
    expect(r.due?.getDate()).toBe(31);
    expect(r.due?.getHours()).toBe(23);
    expect(r.due?.getMinutes()).toBe(59);
  });

  it('parses Hindi kal and baje', () => {
    const r = parseUtterance('कल शाम 5 बजे मॉम को कॉल करो', NOW);
    expect(r.due?.getDate()).toBe(31);
    expect(r.due?.getHours()).toBe(17);
    expect(r.title.length).toBeGreaterThan(2);
  });

  it('parses Hinglish friday tak', () => {
    const r = parseUtterance('DBMS assignment friday tak', NOW);
    expect(r.due).not.toBeNull();
    expect(r.due?.getDay()).toBe(5);
  });

  it('detects what is due this week', () => {
    expect(parseUtterance("what's due this week", NOW).intent).toBe('query_week');
    expect(parseUtterance('iss hafte kya due hai', NOW).intent).toBe('query_week');
  });

  it('detects mark done', () => {
    const r = parseUtterance('mark call mom done', NOW);
    expect(r.intent).toBe('complete');
    expect(r.completeQuery?.toLowerCase()).toContain('call mom');
  });

  it('flags title-only as needs review', () => {
    const r = parseUtterance('maybe something later', NOW);
    expect(r.needsReview).toBe(true);
  });
});

describe('groupDeadlines', () => {
  it('splits overdue, this week, upcoming', () => {
    const g = groupDeadlines([
      { due: new Date(2026, 9, 20, 10, 0, 0).toISOString(), state: 'todo' },
      { due: new Date(2026, 9, 31, 10, 0, 0).toISOString(), state: 'todo' },
      { due: new Date(2026, 11, 1, 10, 0, 0).toISOString(), state: 'todo' },
      { due: new Date(2026, 9, 31, 10, 0, 0).toISOString(), state: 'done' },
    ], NOW);
    expect(g.overdue).toHaveLength(1);
    expect(g.thisWeek).toHaveLength(1);
    expect(g.upcoming).toHaveLength(1);
  });
});

describe('extractDeadlines', () => {
  it('keeps calendar events and filters email by domain', () => {
    const out = extractDeadlines([
      { id: 'cal:1', source: 'calendar', title: 'Lab viva', body: '', when: '2026-11-02T10:00:00.000Z' },
      { id: 'mail:x:prof@university.edu', source: 'email', title: 'Assignment due Friday', body: 'from:prof@university.edu submit by Friday', when: null },
      { id: 'mail:y:promo@spam.com', source: 'email', title: 'Sale ends Friday', body: 'from:promo@spam.com buy now', when: null },
    ], 'university.edu');
    expect(out.some((x) => x.source === 'calendar')).toBe(true);
    expect(out.some((x) => x.sourceRef.includes('university.edu'))).toBe(true);
    expect(out.some((x) => x.sourceRef.includes('spam.com'))).toBe(false);
  });
});

describe('reminders', () => {
  it('schedules 3d 1d 3h only in the future', () => {
    const due = new Date(NOW.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString();
    const times = reminderTimes(due, NOW);
    expect(times).toHaveLength(3);
  });

  it('skips past offsets', () => {
    const due = new Date(NOW.getTime() + 2 * 60 * 60 * 1000).toISOString();
    const times = reminderTimes(due, NOW);
    expect(times).toHaveLength(0);
  });

  it('snoozes to tomorrow morning', () => {
    const d = snoozeTomorrowMorning(NOW);
    expect(d.getDate()).toBe(31);
    expect(d.getHours()).toBe(9);
  });
});
