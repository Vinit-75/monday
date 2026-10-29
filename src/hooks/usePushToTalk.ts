import { useRef, useState } from 'react';
import { createSpeechInput } from '../core/speechInput';
import { resolveSpeech, fuzzyFindTask } from '../core/voice';
import { db } from '../db/db';
import { taskStore } from '../db/taskStore';
import { groupDeadlines } from '../lib/parser';
import { useAppStore } from '../stores/app';
import { format } from 'date-fns';

export function usePushToTalk() {
  const speech = useRef(createSpeechInput());
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [needTranscript, setNeedTranscript] = useState(false);
  const setPending = useAppStore((s) => s.setPending);
  const language = useAppStore((s) => s.settings.language);

  async function start() {
    setNotice(null);
    setListening(true);
    await speech.current.start(language);
  }

  async function stop() {
    const result = await speech.current.stop();
    setListening(false);
    const { transcript, parsed, usedFallback } = await resolveSpeech(result, language);
    if (usedFallback === 'edit' || !transcript) {
      setNeedTranscript(true);
      return;
    }
    await applyParsed(parsed, transcript);
  }

  async function toggle() {
    if (listening) await stop();
    else await start();
  }

  async function applyParsed(parsed: Parameters<typeof setPending>[0] & object, transcript: string) {
    if (!parsed) return;
    if (parsed.intent === 'query_week') {
      const tasks = await db.tasks.toArray();
      const g = groupDeadlines(tasks);
      const n = g.thisWeek.length;
      const lines = (g.thisWeek as typeof tasks).slice(0, 5).map((t) => t.title + (t.due ? ` · ${format(new Date(t.due), 'EEE p')}` : ''));
      setNotice(n === 0 ? 'Nothing due this week.' : `${n} due this week: ${lines.join('; ')}`);
      return;
    }
    if (parsed.intent === 'complete') {
      const tasks = await db.tasks.toArray();
      const hit = fuzzyFindTask(tasks, parsed.completeQuery || parsed.title);
      if (hit) {
        await taskStore.complete(hit.id);
        setNotice(`Marked done: ${hit.title}`);
      } else {
        setNotice(`Could not find “${parsed.completeQuery || parsed.title}”`);
      }
      return;
    }
    setPending(parsed, transcript);
  }

  return { listening, notice, setNotice, needTranscript, setNeedTranscript, toggle, applyParsed };
}
