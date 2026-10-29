import { useLiveQuery } from 'dexie-react-hooks';
import { Calendar, Inbox, Moon, Sparkles, Sun, CheckCircle2, Plus, Settings, Mail } from 'lucide-react';
import { db } from '../../db/db';
import { useAppStore } from '../../stores/app';
import clsx from 'clsx';
import { nanoid } from 'nanoid';
import type { Project, SmartList } from '../../lib/types';

export default function Sidebar() {
  const { activeList, setActiveList, theme, toggleTheme, setSettingsOpen } = useAppStore();
  const pendingReview = useLiveQuery(() => db.extractions.where('status').equals('pending').count(), []);
  const projects = useLiveQuery(() => db.projects.orderBy('sortOrder').toArray(), []);
  const counts = useLiveQuery(async () => {
    const all = await db.tasks.toArray();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    return {
      today: all.filter((t) => t.state !== 'done' && t.due).length,
      inbox: all.filter((t) => !t.projectId && t.state !== 'done').length,
      upcoming: all.filter((t) => t.state !== 'done' && t.due && new Date(t.due) >= tomorrow).length,
      someday: all.filter((t) => t.state !== 'done' && !t.due).length,
      completed: all.filter((t) => t.state === 'done').length,
      byProject: all.reduce<Record<string, number>>((acc, t) => {
        if (t.projectId && t.state !== 'done') acc[t.projectId] = (acc[t.projectId] ?? 0) + 1;
        return acc;
      }, {}),
    };
  }, []);

  const items: { key: SmartList; label: string; icon: typeof Inbox; count?: number }[] = [
    { key: 'today', label: 'Deadlines', icon: Sparkles, count: counts?.today },
    { key: 'inbox', label: 'Inbox', icon: Inbox, count: counts?.inbox },
    { key: 'upcoming', label: 'Upcoming', icon: Calendar, count: counts?.upcoming },
    { key: 'someday', label: 'Someday', icon: Moon, count: counts?.someday },
    { key: 'review', label: 'Review', icon: Mail, count: pendingReview },
    { key: 'completed', label: 'Completed', icon: CheckCircle2, count: counts?.completed },
  ];

  async function addProject() {
    const name = window.prompt('Project name?');
    if (!name) return;
    const emoji = window.prompt('Emoji?', '📁') || '📁';
    const colors = ['#aed98c', '#9191ff', '#ffd8a8', '#79bfff', '#f7a8d8', '#8ad8c4'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const sortOrder = (projects?.length ?? 0);
    const p: Project = { id: 'p-' + nanoid(6), name, emoji, color, archived: false, sortOrder };
    await db.projects.add(p);
  }

  return (
    <aside className="glass flex h-full w-[260px] shrink-0 flex-col rounded-[20px] p-4">
      <div className="flex items-center gap-2 px-1 pb-4">
        <div className="h-8 w-8 rounded-xl bg-ink grid place-items-center text-white">
          <span className="display-italic text-white text-base leading-none pt-1">h</span>
        </div>
        <div>
          <div className="font-sans font-semibold leading-tight">Hush</div>
          <div className="mono text-[10px] text-[color:var(--text-faint)]">your quiet agent</div>
        </div>
        <button
          onClick={toggleTheme}
          className="ml-auto grid h-8 w-8 place-items-center rounded-lg hover:bg-[color:var(--surface-raised)]"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto">
        <div className="mono mb-1 px-2 text-[10px] uppercase tracking-wider text-[color:var(--text-faint)]">Lists</div>
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => setActiveList(it.key)}
            className={clsx(
              'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition',
              activeList === it.key
                ? 'bg-[color:var(--surface-raised)] text-[color:var(--text)]'
                : 'text-[color:var(--text-mute)] hover:bg-[color:var(--surface-raised)]/60 hover:text-[color:var(--text)]'
            )}
          >
            <it.icon size={14} className="shrink-0 opacity-70" />
            <span className="flex-1">{it.label}</span>
            {it.count !== undefined && it.count > 0 && (
              <span className="mono text-[10px] text-[color:var(--text-faint)]">{it.count}</span>
            )}
          </button>
        ))}

        <div className="mono mt-6 mb-1 flex items-center justify-between px-2 text-[10px] uppercase tracking-wider text-[color:var(--text-faint)]">
          <span>Projects</span>
          <button onClick={addProject} className="grid h-5 w-5 place-items-center rounded hover:bg-[color:var(--surface-raised)]">
            <Plus size={12} />
          </button>
        </div>
        {projects?.map((p) => {
          const isActive = typeof activeList === 'object' && activeList.kind === 'project' && activeList.id === p.id;
          const count = counts?.byProject[p.id] ?? 0;
          return (
            <button
              key={p.id}
              onClick={() => setActiveList({ kind: 'project', id: p.id })}
              className={clsx(
                'flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition',
                isActive
                  ? 'bg-[color:var(--surface-raised)] text-[color:var(--text)]'
                  : 'text-[color:var(--text-mute)] hover:bg-[color:var(--surface-raised)]/60 hover:text-[color:var(--text)]'
              )}
            >
              <span className="text-sm leading-none">{p.emoji}</span>
              <span className="flex-1">{p.name}</span>
              {count > 0 && <span className="mono text-[10px] text-[color:var(--text-faint)]">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-[color:var(--border-soft)] pt-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="mb-2 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[13px] text-[color:var(--text-mute)] hover:bg-[color:var(--surface-raised)]/60 hover:text-[color:var(--text)]"
        >
          <Settings size={14} className="opacity-70" />
          Settings
        </button>
        <div className="mono text-[10px] text-[color:var(--text-faint)]">
          ⌘K palette · N new · A agent
        </div>
      </div>
    </aside>
  );
}
