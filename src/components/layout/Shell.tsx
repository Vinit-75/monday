import { useEffect } from 'react';
import { ensureSeed } from '../../db/seed';
import Sidebar from './Sidebar';
import Main from './Main';
import AgentDock from '../agent/AgentDock';
import { useAppStore } from '../../stores/app';
import CommandPalette from '../ui/CommandPalette';

export default function Shell() {
  const { agentOpen, setCommandOpen, focusQuickCapture, toggleAgent, setActiveList } = useAppStore();

  useEffect(() => { ensureSeed(); }, []);

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
    </div>
  );
}
