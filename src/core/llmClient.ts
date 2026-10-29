import type { LlmClient } from './interfaces';
import type { ParseResult, SpeechLang } from '../lib/types';
import { secrets } from '../lib/settings';
import { parseUtterance } from '../lib/parser';

export const llmClient: LlmClient = {
  async parseAmbiguous(text, now, tz) {
    const key = await secrets.gemini();
    if (!key) return null;
    const body = {
      contents: [{
        parts: [{
          text: `You extract a student deadline from short English, Hindi, or Hinglish.
Now is ${now.toISOString()} timezone ${tz}.
Return ONLY JSON: {"intent":"add"|"query_week"|"complete","title":string,"due":string|null ISO local,"completeQuery":string|null,"confidence":0-1}
Text: ${text}`,
        }],
      }],
    };
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${encodeURIComponent(key)}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal },
      );
      if (!res.ok) return null;
      const json = await res.json();
      const raw: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) return null;
      const parsed = JSON.parse(match[0]) as { intent: ParseResult['intent']; title: string; due: string | null; completeQuery?: string | null; confidence: number };
      const due = parsed.due ? new Date(parsed.due) : null;
      return {
        intent: parsed.intent || 'add',
        title: parsed.title || text,
        due: due && !Number.isNaN(due.getTime()) ? due : null,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7,
        needsReview: (parsed.confidence ?? 0) < 0.65,
        completeQuery: parsed.completeQuery ?? undefined,
        raw: text,
      };
    } catch {
      return parseUtterance(text, now);
    } finally {
      clearTimeout(to);
    }
  },

  async transcribe(audio, lang: SpeechLang) {
    const key = await secrets.groq();
    if (!key) return null;
    const fd = new FormData();
    fd.append('file', audio, 'clip.webm');
    fd.append('model', 'whisper-large-v3-turbo');
    if (lang === 'en') fd.append('language', 'en');
    if (lang === 'hi') fd.append('language', 'hi');
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 5000);
    try {
      const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: fd,
        signal: ctrl.signal,
      });
      if (!res.ok) return null;
      const json = await res.json();
      return typeof json.text === 'string' ? json.text : null;
    } catch {
      return null;
    } finally {
      clearTimeout(to);
    }
  },

  async generate(prompt) {
    const key = await secrets.gemini();
    if (!key) return null;
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${encodeURIComponent(key)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
          signal: ctrl.signal,
        },
      );
      if (!res.ok) return null;
      const json = await res.json();
      const text: string = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return text.trim() || null;
    } catch {
      return null;
    } finally {
      clearTimeout(to);
    }
  },
};
