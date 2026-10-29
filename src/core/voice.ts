import { parseUtterance } from '../lib/parser';
import type { ParseResult, SpeechLang, SpeechResult } from '../lib/types';
import { llmClient } from './llmClient';

export async function resolveSpeech(result: SpeechResult, lang: SpeechLang, now = new Date()): Promise<{
  transcript: string;
  parsed: ParseResult;
  usedFallback: 'none' | 'whisper' | 'edit';
}> {
  let transcript = result.transcript.trim();
  let usedFallback: 'none' | 'whisper' | 'edit' = 'none';

  const weak = !transcript || result.confidence < 0.55;
  if (weak && result.audio && result.audio.size > 800) {
    const whispered = await llmClient.transcribe(result.audio, lang);
    if (whispered?.trim()) {
      transcript = whispered.trim();
      usedFallback = 'whisper';
    }
  }

  if (!transcript) {
    return {
      transcript: '',
      parsed: { intent: 'unknown', title: '', due: null, confidence: 0, needsReview: true, raw: '' },
      usedFallback: 'edit',
    };
  }

  let parsed = parseUtterance(transcript, now);
  if (parsed.needsReview || parsed.confidence < 0.65) {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const llm = await llmClient.parseAmbiguous(transcript, now, tz);
    if (llm && llm.confidence >= parsed.confidence) parsed = llm;
  }
  return { transcript, parsed, usedFallback };
}

export function fuzzyFindTask<T extends { id: string; title: string; state: string }>(tasks: T[], query: string): T | undefined {
  const q = query.toLowerCase().trim();
  if (!q) return undefined;
  const open = tasks.filter((t) => t.state !== 'done');
  return open.find((t) => t.title.toLowerCase() === q)
    || open.find((t) => t.title.toLowerCase().includes(q))
    || open.find((t) => q.includes(t.title.toLowerCase()));
}
