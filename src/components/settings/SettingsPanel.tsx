import { useEffect, useState } from 'react';
import { useAppStore } from '../../stores/app';
import { loadPublicSettings, savePublicSettings, secrets, type PublicSettings } from '../../lib/settings';
import { googleSignIn } from '../../lib/google';
import { requestNotifyPermission, initNotifications } from '../../lib/notify';
import type { SpeechLang } from '../../lib/types';

export default function SettingsPanel() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const reload = useAppStore((s) => s.reloadSettings);
  const [form, setForm] = useState<PublicSettings>(loadPublicSettings());
  const [groq, setGroq] = useState('');
  const [gemini, setGemini] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!open) return;
    setForm(loadPublicSettings());
    secrets.groq().then((v) => setGroq(v ? '••••••••' : ''));
    secrets.gemini().then((v) => setGemini(v ? '••••••••' : ''));
  }, [open]);

  if (!open) return null;

  async function save() {
    savePublicSettings(form);
    if (groq && !groq.startsWith('•')) await secrets.setGroq(groq.trim());
    if (gemini && !gemini.startsWith('•')) await secrets.setGemini(gemini.trim());
    reload();
    setStatus('Saved');
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/45 p-4" onClick={() => setOpen(false)}>
      <div className="glass-strong flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl p-5" onClick={(e) => e.stopPropagation()}>
        <div className="display text-3xl">Settings</div>
        <p className="mt-1 text-sm text-[color:var(--text-mute)]">Keys stay in encrypted storage on this device. Nothing is baked into the app.</p>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">

        <label className="mt-5 block text-xs text-[color:var(--text-faint)]">Language</label>
        <select
          className="mt-1 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm"
          value={form.language}
          onChange={(e) => setForm({ ...form, language: e.target.value as SpeechLang })}
        >
          <option value="auto">Auto</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>

        <label className="mt-4 block text-xs text-[color:var(--text-faint)]">University sender filter</label>
        <input
          className="mt-1 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none"
          placeholder="university.edu"
          value={form.senderDomain}
          onChange={(e) => setForm({ ...form, senderDomain: e.target.value })}
        />

        <label className="mt-4 block text-xs text-[color:var(--text-faint)]">Groq API key (Whisper fallback)</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none"
          value={groq}
          onChange={(e) => setGroq(e.target.value)}
          placeholder="gsk_…"
        />

        <label className="mt-4 block text-xs text-[color:var(--text-faint)]">Gemini API key (ambiguous parse)</label>
        <input
          type="password"
          className="mt-1 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none"
          value={gemini}
          onChange={(e) => setGemini(e.target.value)}
          placeholder="AIza…"
        />

        <label className="mt-4 block text-xs text-[color:var(--text-faint)]">Google OAuth client ID</label>
        <input
          className="mt-1 w-full rounded-lg bg-[color:var(--surface-raised)] px-3 py-2 text-sm outline-none"
          value={form.googleClientId}
          onChange={(e) => setForm({ ...form, googleClientId: e.target.value })}
          placeholder="….apps.googleusercontent.com"
        />
        <button
          className="btn btn-ghost mt-2 !py-1.5 !px-3 text-xs"
          onClick={async () => {
            savePublicSettings(form);
            const ok = await googleSignIn();
            setStatus(ok ? 'Google connected' : 'Google sign-in cancelled or missing client ID');
            reload();
            setForm(loadPublicSettings());
          }}
        >
          Sign in to Gmail and Calendar
        </button>

        <button
          className="btn btn-ghost mt-3 !py-1.5 !px-3 text-xs"
          onClick={async () => {
            const p = await requestNotifyPermission();
            if (p === 'granted') await initNotifications();
            setStatus(p === 'granted' ? 'Notifications on' : 'Notifications blocked');
          }}
        >
          Enable deadline notifications
        </button>

        </div>
        <div className="mt-5 flex shrink-0 items-center gap-2">
          <button className="btn btn-primary !py-2 !px-4 text-xs" onClick={save}>Save</button>
          <button className="btn btn-ghost !py-2 !px-4 text-xs" onClick={() => setOpen(false)}>Close</button>
          {status && <span className="mono text-[11px] text-[color:var(--text-faint)]">{status}</span>}
        </div>
      </div>
    </div>
  );
}
