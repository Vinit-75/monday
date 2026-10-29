import { secrets, loadPublicSettings, savePublicSettings } from './settings';
import type { RawItem } from './extract';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }) => { requestAccessToken: () => void };
        };
      };
    };
  }
}

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.readonly',
].join(' ');

function loadGis(): Promise<void> {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Google Identity failed to load'));
    document.head.appendChild(s);
  });
}

export async function googleSignIn(): Promise<boolean> {
  const settings = loadPublicSettings();
  if (!settings.googleClientId.trim()) return false;
  await loadGis();
  return new Promise((resolve) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: settings.googleClientId.trim(),
      scope: SCOPES,
      callback: async (resp) => {
        if (!resp.access_token) {
          resolve(false);
          return;
        }
        await secrets.setGoogleToken(resp.access_token);
        savePublicSettings({ ...settings, googleSignedInAt: new Date().toISOString() });
        resolve(true);
      },
    });
    client.requestAccessToken();
  });
}

async function authHeader(): Promise<Record<string, string> | null> {
  const token = await secrets.googleToken();
  if (!token) return null;
  return { Authorization: `Bearer ${token}` };
}

export async function fetchGoogleDeadlines(): Promise<RawItem[]> {
  const headers = await authHeader();
  if (!headers) return [];
  const settings = loadPublicSettings();
  const domain = settings.senderDomain.replace(/^@/, '').trim();
  const items: RawItem[] = [];

  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + 60 * 86400000).toISOString();
  try {
    const cal = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&maxResults=40`,
      { headers },
    );
    if (cal.status === 401) return [];
    if (cal.ok) {
      const json = await cal.json();
      for (const ev of json.items ?? []) {
        const when = ev.start?.dateTime || (ev.start?.date ? `${ev.start.date}T17:00:00` : null);
        items.push({
          id: `cal:${ev.id}`,
          source: 'calendar',
          title: ev.summary || 'Event',
          body: ev.description || '',
          when,
        });
      }
    }
  } catch {
    /* ignore calendar errors */
  }

  try {
    const q = domain ? `from:@${domain} newer_than:21d` : 'newer_than:7d';
    const list = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=20`,
      { headers },
    );
    if (list.ok) {
      const json = await list.json();
      for (const m of json.messages ?? []) {
        const full = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
          { headers },
        );
        if (!full.ok) continue;
        const msg = await full.json();
        const headersList: { name: string; value: string }[] = msg.payload?.headers ?? [];
        const subject = headersList.find((h) => h.name === 'Subject')?.value ?? '(no subject)';
        const from = headersList.find((h) => h.name === 'From')?.value ?? '';
        const snippet = msg.snippet ?? '';
        items.push({
          id: `mail:${m.id}:${from}`,
          source: 'email',
          title: subject,
          body: `${from} ${snippet}`,
          when: null,
        });
      }
    }
  } catch {
    /* ignore gmail errors */
  }

  return items;
}
