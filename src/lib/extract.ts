import { parseUtterance } from './parser';

export interface RawItem {
  id: string;
  source: 'email' | 'calendar';
  title: string;
  body: string;
  when: string | null;
}

const DEADLINE_HINT = /due|deadline|submit|submission|assignment|exam|quiz|last date|जमा|अंतिम/i;

export function extractDeadlines(items: RawItem[], domainFilter: string) {
  const domain = domainFilter.replace(/^@/, '').toLowerCase().trim();
  return items.flatMap((item) => {
    if (item.source === 'email' && domain) {
      const hay = `${item.id} ${item.title} ${item.body}`.toLowerCase();
      if (!hay.includes(domain) && !item.id.toLowerCase().includes(domain)) return [];
    }
    if (item.source === 'calendar' && item.when) {
      return [{
        title: item.title.trim() || 'Calendar event',
        due: item.when,
        source: item.source,
        sourceRef: item.id,
        snippet: item.body.slice(0, 180),
      }];
    }
    const blob = `${item.title}. ${item.body}`.slice(0, 800);
    if (!DEADLINE_HINT.test(blob) && item.source === 'email') return [];
    const parsed = parseUtterance(blob);
    if (!parsed.title) return [];
    if (item.source === 'email' && !parsed.due && !DEADLINE_HINT.test(blob)) return [];
    return [{
      title: parsed.title.slice(0, 140),
      due: parsed.due ? parsed.due.toISOString() : item.when,
      source: item.source,
      sourceRef: item.id,
      snippet: blob.slice(0, 180),
    }];
  });
}
