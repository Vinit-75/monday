import { getSecret, setSecret } from './secureStore';
import type { SpeechLang } from './types';

const KEYS = {
  groq: 'api.groq',
  gemini: 'api.gemini',
  googleToken: 'google.token',
} as const;

export interface PublicSettings {
  language: SpeechLang;
  senderDomain: string;
  googleClientId: string;
  googleSignedInAt: string | null;
}

const DEFAULTS: PublicSettings = {
  language: 'auto',
  senderDomain: '',
  googleClientId: '',
  googleSignedInAt: null,
};

export function loadPublicSettings(): PublicSettings {
  try {
    const raw = localStorage.getItem('hush.settings');
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePublicSettings(s: PublicSettings): void {
  localStorage.setItem('hush.settings', JSON.stringify(s));
}

export const secrets = {
  groq: () => getSecret(KEYS.groq),
  gemini: () => getSecret(KEYS.gemini),
  googleToken: () => getSecret(KEYS.googleToken),
  setGroq: (v: string) => setSecret(KEYS.groq, v),
  setGemini: (v: string) => setSecret(KEYS.gemini, v),
  setGoogleToken: (v: string) => setSecret(KEYS.googleToken, v),
};

export function tokenNeedsRefresh(signedInAt: string | null, now = new Date()): boolean {
  if (!signedInAt) return false;
  const age = now.getTime() - new Date(signedInAt).getTime();
  return age > 6 * 24 * 60 * 60 * 1000;
}
