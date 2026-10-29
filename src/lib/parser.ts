import type { ParseIntent, ParseResult } from './types';

const WEEKDAYS_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const WEEKDAYS_SHORT = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
const WEEKDAYS_HI = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
const WEEKDAYS_HI_SHORT = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
const WEEKDAYS_HINGLISH = ['raviwar', 'somwar', 'mangalwar', 'budhwar', 'guruwar', 'shukrawar', 'shaniwar'];
const WEEKDAYS_HINGLISH_ALT = ['ravivar', 'somvar', 'mangalvar', 'budhvar', 'guruvar', 'shukravar', 'shanivar'];

const MONTHS: Record<string, number> = {
  jan: 0, january: 0, जनवरी: 0,
  feb: 1, february: 1, फरवरी: 1,
  mar: 2, march: 2, मार्च: 2,
  apr: 3, april: 3, अप्रैल: 3,
  may: 4, मई: 4,
  jun: 5, june: 5, जून: 5,
  jul: 6, july: 6, जुलाई: 6,
  aug: 7, august: 7, अगस्त: 7,
  sep: 8, sept: 8, september: 8, सितंबर: 8, सितम्बर: 8,
  oct: 9, october: 9, अक्टूबर: 9,
  nov: 10, november: 10, नवंबर: 10, नवम्बर: 10,
  dec: 11, december: 11, दिसंबर: 11, दिसम्बर: 11,
};

export function parseUtterance(raw: string, now: Date = new Date()): ParseResult {
  const original = raw.trim();
  if (!original) {
    return { intent: 'unknown', title: '', due: null, confidence: 0, needsReview: true, raw: original };
  }

  const intent = detectIntent(original);
  if (intent === 'query_week') {
    return { intent, title: '', due: null, confidence: 0.95, needsReview: false, raw: original };
  }

  let text = original;
  if (intent === 'complete') {
    const completeQuery = stripCompleteCue(original);
    return {
      intent: 'complete',
      title: completeQuery,
      due: null,
      confidence: completeQuery.length > 1 ? 0.85 : 0.4,
      needsReview: completeQuery.length <= 1,
      completeQuery,
      raw: original,
    };
  }

  const { due, remainder, dateScore } = extractDateTime(text, now);
  const title = cleanTitle(remainder) || original;
  const confidence = score(title, due, dateScore, original);
  return {
    intent: 'add',
    title,
    due,
    confidence,
    needsReview: confidence < 0.65,
    raw: original,
  };
}

function detectIntent(text: string): ParseIntent {
  const t = text.toLowerCase();
  if (
    /what('?s| is)? due (this )?week/.test(t) ||
    /due this week/.test(t) ||
    /this week('?s)? (deadlines|tasks|due)/.test(t) ||
    /इस हफ्ते/.test(text) ||
    /is hafte/.test(t) ||
    /iss hafte/.test(t)
  ) {
    return 'query_week';
  }
  if (
    /^(mark|complete|finish|done with)\b/.test(t) ||
    /\bmark(ed)? (as )?done\b/.test(t) ||
    /\bho gaya\b/.test(t) ||
    /\bho gya\b/.test(t) ||
    /कर दिया/.test(text) ||
    /हो गया/.test(text)
  ) {
    return 'complete';
  }
  return 'add';
}

function stripCompleteCue(text: string): string {
  return text
    .replace(/^(mark|complete|finish|done with)\s+/i, '')
    .replace(/\s+(as\s+)?(done|complete|finished)$/i, '')
    .replace(/\s+ho gaya$/i, '')
    .replace(/\s+ho gya$/i, '')
    .replace(/\s+कर दिया$/g, '')
    .replace(/\s+हो गया$/g, '')
    .replace(/^mark\s+/i, '')
    .trim();
}

function extractDateTime(input: string, now: Date): { due: Date | null; remainder: string; dateScore: number } {
  let text = input;
  let due: Date | null = null;
  let dateScore = 0;
  let hadExplicitTime = false;

  const applyDate = (d: Date, score: number) => {
    due = d;
    dateScore = Math.max(dateScore, score);
  };

  const slash = text.match(/\b(\d{1,2})[\/\-.](\d{1,2})(?:[\/\-.](\d{2,4}))?\b/);
  if (slash) {
    const day = parseInt(slash[1], 10);
    const month = parseInt(slash[2], 10) - 1;
    const year = slash[3] ? normalizeYear(parseInt(slash[3], 10), now) : now.getFullYear();
    if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
      applyDate(atDefault(now, year, month, day), 0.85);
      text = text.replace(slash[0], ' ');
    }
  }

  const named = text.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|सितम्बर|अक्टूबर|नवंबर|नवम्बर|दिसंबर|दिसम्बर)\b/i)
    || text.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t(?:ember)?)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?|जनवरी|फरवरी|मार्च|अप्रैल|मई|जून|जुलाई|अगस्त|सितंबर|सितम्बर|अक्टूबर|नवंबर|नवम्बर|दिसंबर|दिसम्बर)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i);
  if (named) {
    const a = named[1];
    const b = named[2];
    const monthToken = MONTHS[a.toLowerCase()] != null ? a : b;
    const dayToken = MONTHS[a.toLowerCase()] != null ? b : a;
    const month = MONTHS[monthToken.toLowerCase()];
    const day = parseInt(dayToken, 10);
    if (month != null && day >= 1 && day <= 31) {
      let year = now.getFullYear();
      const candidate = atDefault(now, year, month, day);
      if (startOfDay(candidate) < startOfDay(now)) year += 1;
      applyDate(atDefault(now, year, month, day), 0.9);
      text = text.replace(named[0], ' ');
    }
  }

  const rel = matchRelative(text, now);
  if (rel) {
    applyDate(rel.date, rel.score);
    text = text.replace(rel.match, ' ');
  }

  const week = matchWeekday(text, now);
  if (week && !due) {
    applyDate(week.date, week.score);
    text = text.replace(week.match, ' ');
  }

  const inDays = text.match(/\bin\s+(\d{1,2})\s+days?\b/i) || text.match(/\b(\d{1,2})\s+din(?:on)?\s+(?:mein|me|baad)\b/i) || text.match(/(\d{1,2})\s+दिन/);
  if (inDays && !due) {
    const n = parseInt(inDays[1], 10);
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    applyDate(atDefault(now, d.getFullYear(), d.getMonth(), d.getDate()), 0.8);
    text = text.replace(inDays[0], ' ');
  }

  const time = matchTime(text);
  if (time) {
    hadExplicitTime = true;
    if (!due) due = new Date(now);
    due.setHours(time.h, time.m, 0, 0);
    dateScore = Math.max(dateScore, 0.7);
    text = text.replace(time.match, ' ');
    if (time.h === 23 && time.m === 59) dateScore = Math.max(dateScore, 0.85);
  }

  if (due && !hadExplicitTime) {
    due = applyDefaultTime(due, input);
  }

  if (due && due.getTime() < now.getTime() - 60_000 && hadExplicitTime && isSameDay(due, now)) {
    due.setDate(due.getDate() + 1);
  }

  return { due, remainder: text, dateScore };
}

function matchRelative(text: string, now: Date): { date: Date; match: string; score: number } | null {
  const lower = text.toLowerCase();
  const rules: { re: RegExp; days: number; score: number }[] = [
    { re: /\bday after tomorrow\b/i, days: 2, score: 0.95 },
    { re: /\bpars(?:o|on)\b/i, days: 2, score: 0.9 },
    { re: /परसों/g, days: 2, score: 0.9 },
    { re: /\btomorrow\b/i, days: 1, score: 0.95 },
    { re: /\bkal\b/i, days: 1, score: 0.8 },
    { re: /कल(?!\s*कल)/, days: 1, score: 0.8 },
    { re: /\btoday\b/i, days: 0, score: 0.95 },
    { re: /\baaj\b/i, days: 0, score: 0.9 },
    { re: /आज/, days: 0, score: 0.9 },
    { re: /\bnext week\b/i, days: 7, score: 0.7 },
    { re: /अगले हफ्ते/, days: 7, score: 0.7 },
  ];
  for (const r of rules) {
    const m = text.match(r.re) || lower.match(r.re);
    if (m) {
      const d = new Date(now);
      d.setDate(d.getDate() + r.days);
      return { date: atDefault(now, d.getFullYear(), d.getMonth(), d.getDate()), match: m[0], score: r.score };
    }
  }
  return null;
}

function matchWeekday(text: string, now: Date): { date: Date; match: string; score: number } | null {
  const all = [
    WEEKDAYS_EN, WEEKDAYS_SHORT, WEEKDAYS_HI, WEEKDAYS_HI_SHORT, WEEKDAYS_HINGLISH, WEEKDAYS_HINGLISH_ALT,
  ];
  const lower = text.toLowerCase();
  for (const list of all) {
    for (let i = 0; i < 7; i++) {
      const name = list[i];
      const re = new RegExp(`\\b${escapeRe(name)}(?:day)?\\b`, 'i');
      const m = text.match(re) || lower.match(re);
      if (m) {
        const d = nextWeekday(now, i);
        return { date: d, match: m[0], score: 0.85 };
      }
    }
  }
  return null;
}

function matchTime(text: string): { h: number; m: number; match: string } | null {
  const lower = text.toLowerCase();
  if (/\b11:59\b/.test(text) || /\b11\s*:\s*59\s*(pm)?\b/i.test(text)) {
    const m = text.match(/\b11\s*:\s*59\s*(pm)?\b/i);
    if (m) return { h: 23, m: 59, match: m[0] };
  }
  const clock = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?\b/i);
  if (clock) {
    let h = parseInt(clock[1], 10);
    const min = clock[2] ? parseInt(clock[2], 10) : 0;
    const ap = clock[3]?.replace(/\./g, '').toLowerCase();
    if (ap === 'pm' && h < 12) h += 12;
    if (ap === 'am' && h === 12) h = 0;
    if (!ap) {
      const around = lower;
      if (/shaam|sham|evening|शाम|रात|raat|night/.test(around) && h <= 12) {
        if (h < 12) h += 12;
      }
      if (/subah|morning|सुबह/.test(around) && h === 12) h = 0;
    }
    if (h <= 23 && min <= 59 && (ap || clock[2] || /baje|बजे/.test(lower))) {
      return { h, m: min, match: clock[0] };
    }
    if (h <= 23 && min <= 59 && ap) return { h, m: min, match: clock[0] };
  }
  const baje = text.match(/\b(\d{1,2})\s*(?::(\d{2}))?\s*(baje|बजे)\b/i);
  if (baje) {
    let h = parseInt(baje[1], 10);
    const min = baje[2] ? parseInt(baje[2], 10) : 0;
    if (/shaam|शाम|raat|रात/.test(lower) && h < 12) h += 12;
    return { h, m: min, match: baje[0] };
  }
  return null;
}

function applyDefaultTime(d: Date, original: string): Date {
  const copy = new Date(d);
  const academic = /assign|submit|deadline|due|exam|quiz|project|assignment|जमा|असाइन/i.test(original);
  if (academic) copy.setHours(23, 59, 0, 0);
  else copy.setHours(17, 0, 0, 0);
  return copy;
}

function atDefault(now: Date, y: number, m: number, day: number): Date {
  const d = new Date(now);
  d.setFullYear(y, m, day);
  d.setHours(17, 0, 0, 0);
  return d;
}

function nextWeekday(now: Date, target: number): Date {
  const d = new Date(now);
  const diff = (target - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 0 : diff));
  d.setHours(17, 0, 0, 0);
  if (diff === 0 && d.getTime() < now.getTime()) d.setDate(d.getDate() + 7);
  return d;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function normalizeYear(y: number, now: Date): number {
  if (y < 100) return 2000 + y;
  return y || now.getFullYear();
}

function cleanTitle(text: string): string {
  return text
    .replace(/\btak\b/gi, '')
    .replace(/तक/g, '')
    .replace(/\bremind me to\b/gi, '')
    .replace(/\badd( a)? task\b/gi, '')
    .replace(/\bplease\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function score(title: string, due: Date | null, dateScore: number, raw: string): number {
  if (!title) return 0.2;
  let s = 0.5;
  if (due) s = 0.55 + dateScore * 0.4;
  else s = 0.45;
  if (title.split(/\s+/).length >= 2) s += 0.08;
  if (/[?]/.test(raw) && !due) s -= 0.2;
  return Math.max(0.1, Math.min(0.99, s));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function groupDeadlines<T extends { due: string | null; state: string }>(tasks: T[], now = new Date()) {
  const start = startOfDay(now).getTime();
  const weekEnd = start + 7 * 24 * 60 * 60 * 1000;
  const open = tasks.filter((t) => t.state !== 'done' && t.due);
  return {
    overdue: open.filter((t) => new Date(t.due!).getTime() < start),
    thisWeek: open.filter((t) => {
      const ms = new Date(t.due!).getTime();
      return ms >= start && ms < weekEnd;
    }),
    upcoming: open.filter((t) => new Date(t.due!).getTime() >= weekEnd),
  };
}
