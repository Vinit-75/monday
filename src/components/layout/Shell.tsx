import { useEffect } from 'react';
import { ensureSeed } from '../../db/seed';
import Sidebar from './Sidebar';
import Main from './Main';
import AgentDock from '../agent/AgentDock';
import { useAppStore } from '../../stores/app';
import CommandPalette from '../ui/CommandPalette';
import ConfirmCard from '../tasks/ConfirmCard';
import TaskEditor from '../tasks/TaskEditor';
import SettingsPanel from '../settings/SettingsPanel';
import { initNotifications } from '../../lib/notify';
import { taskStore } from '../../db/taskStore';
import { snoozeBy } from '../../lib/reminders';
import { tokenNeedsRefresh } from '../../lib/settings';

export default function Shell() {
  const { agentOpen, setCommandOpen, focusQuickCapture, toggleAgent, setActiveList } = useAppStore();

  useEffect(() => { ensureSeed().then(() => initNotifications()); }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const data = e.data || {};
      if (data.type === 'COMPLETE_TASK' && data.taskId) void taskStore.complete(data.taskId);
      if (data.type === 'SNOOZE_TASK' && data.taskId) {
        void (async () => {
          const t = await taskStore.get(data.taskId);
          await taskStore.snooze(data.taskId, snoozeBy(t?.due ?? null, 1));
        })();
      }
    };
    navigator.serviceWorker?.addEventListener('message', onMsg);
    return () => navigator.serviceWorker?.removeEventListener('message', onMsg);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inField = ['INPUT', 'TEXTAREA'].includes(target.tagName) || target.isContentEditable;
      if (inField && e.key !== 'Escape') return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCommandOpen(true); return; }
      if (e.key === 'n') { e.preventDefault(); focusQuickCapture(); }
      if (e.key === 'a') { e.preventDefault(); toggleAgent(); }
      if (e.key === 't') { e.preventDefault(); setActiveList('today'); }
      if (e.key === 'i') { e.preventDefault(); setActiveList('inbox'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setCommandOpen, focusQuickCapture, toggleAgent, setActiveList]);

  return (
    <div className="relative z-10 flex h-full w-full gap-3 p-3">
      <Sidebar />
      <Main />
      {agentOpen && <AgentDock />}
      <CommandPalette />
      <ConfirmCard />
      <TaskEditor />
      <SettingsPanel />
      <ReauthBanner />
    </div>
  );
}

function ReauthBanner() {
  const settings = useAppStore((s) => s.settings);
  const setSettingsOpen = useAppStore((s) => s.setSettingsOpen);
  if (!tokenNeedsRefresh(settings.googleSignedInAt)) return null;
  return (
    <button
      onClick={() => setSettingsOpen(true)}
      className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-amber-200/20 px-4 py-2 text-xs text-amber-50 ring-1 ring-amber-200/30"
    >
      Google access expires about weekly. Tap to re-sign in.
    </button>
  );
}
