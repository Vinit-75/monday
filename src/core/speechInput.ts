import type { SpeechInput } from './interfaces';
import type { SpeechLang, SpeechResult } from '../lib/types';

type Rec = SpeechRecognition;

function SpeechCtor(): (new () => Rec) | null {
  const w = window as Window & { SpeechRecognition?: new () => Rec; webkitSpeechRecognition?: new () => Rec };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function langCode(lang: SpeechLang): string {
  if (lang === 'hi') return 'hi-IN';
  if (lang === 'en') return 'en-IN';
  const nav = navigator.language || 'en-IN';
  if (nav.toLowerCase().startsWith('hi')) return 'hi-IN';
  return 'en-IN';
}

export function createSpeechInput(): SpeechInput {
  let rec: Rec | null = null;
  let media: MediaRecorder | null = null;
  let chunks: Blob[] = [];
  let stream: MediaStream | null = null;
  let finalText = '';
  let conf = 0;
  let usedLang = 'en-IN';

  return {
    async start(lang) {
      finalText = '';
      conf = 0;
      chunks = [];
      usedLang = langCode(lang);
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        media = new MediaRecorder(stream);
        media.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
        media.start();
      } catch {
        stream = null;
      }
      const Ctor = SpeechCtor();
      if (!Ctor) return;
      rec = new Ctor();
      rec.lang = usedLang;
      rec.interimResults = true;
      rec.continuous = true;
      rec.onresult = (e: SpeechRecognitionEvent) => {
        let t = '';
        let c = 0;
        let n = 0;
        for (let i = 0; i < e.results.length; i++) {
          t += e.results[i][0].transcript;
          c += e.results[i][0].confidence || 0;
          n += 1;
        }
        finalText = t.trim();
        conf = n ? c / n : 0;
      };
      rec.start();
    },

    async stop() {
      rec?.stop();
      rec = null;
      const audio = await stopRecorder();
      const result: SpeechResult = {
        transcript: finalText,
        confidence: conf,
        lang: usedLang,
        audio,
      };
      return result;
    },

    abort() {
      rec?.abort();
      rec = null;
      void stopRecorder();
    },
  };

  function stopRecorder(): Promise<Blob | null> {
    return new Promise((resolve) => {
      stream?.getTracks().forEach((t) => t.stop());
      if (!media || media.state === 'inactive') {
        stream = null;
        resolve(chunks.length ? new Blob(chunks, { type: 'audio/webm' }) : null);
        return;
      }
      media.onstop = () => {
        const blob = chunks.length ? new Blob(chunks, { type: 'audio/webm' }) : null;
        stream = null;
        media = null;
        resolve(blob);
      };
      media.stop();
    });
  }
}
