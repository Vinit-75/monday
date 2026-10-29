import { useLiveQuery } from 'dexie-react-hooks';
import { Columns3, LayoutList, CalendarRange, Search, MessageCircle, X } from 'lucide-react';
import { db } from '../../db/db';
import { useAppStore } from '../../stores/app';
import clsx from 'clsx';
import { format } from 'date-fns';

export default function ViewHeader() {
  const { activeList, viewMode, setViewMode, search, setSearch, agentOpen, toggleAgent } = useAppStore();
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  let title = 'Today';
  let subtitle: string | null = format(new Date(), 'EEEE, MMMM d');
  let emoji: string | null = null;

  if (typeof activeList === 'string') {
    const titles: Record<string, string> = {
      today: 'Today', inbox: 'Inbox', upcoming: 'Upcoming', someday: 'Someday', completed: 'Completed',
    };
    const subs: Record<string, string> = {
      today: format(new Date(), 'EEEE, MMMM d'),
      inbox: 'Unsorted captures',
      upcoming: 'The next seven days',
      someday: 'Not scheduled yet',
      completed: 'Nice work',
    };
    title = titles[activeList]; subtitle = subs[activeList];
  } else {
    const p = projects?.find((x) => x.id === activeList.id);
    title = p?.name ?? 'Project';
    emoji = p?.emoji ?? '📁';
    subtitle = null;
  }

  return (
    <header className="flex shrink-0 items-end justify-between gap-4 border-b border-[color:var(--border-soft)] px-6 py-5">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {emoji && <span className="text-3xl leading-none">{emoji}</span>}
          <h1 className="truncate">
            <span className="display text-[42px] leading-none">{title.split(' ')[0]}</span>
            {title.split(' ').slice(1).length > 0 && (
              <span className="display-italic text-[42px] leading-none"> {title.split(' ').slice(1).join(' ')}</span>
            )}
          </h1>
        </div>
        {subtitle && <div className="mono mt-1 text-xs text-[color:var(--text-faint)]">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="w-56 rounded-full bg-[color:var(--surface-raised)] py-1.5 pl-8 pr-3 text-xs placeholder:text-[color:var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-brand-primary/40"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 hover:bg-[color:var(--surface-raised)]"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-0.5 rounded-full bg-[color:var(--surface-raised)] p-0.5">
          {([['list', LayoutList], ['board', Columns3], ['calendar', CalendarRange]] as const).map(([mode, Icon]) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={clsx(
                'grid h-7 w-7 place-items-center rounded-full transition',
                viewMode === mode ? 'bg-[color:var(--text)] text-[color:var(--surface-strong)]' : 'opacity-70 hover:opacity-100'
              )}
              aria-label={mode}
            >
              <Icon size={13} />
            </button>
          ))}
        </div>

        <button
          onClick={toggleAgent}
          className={clsx('grid h-8 w-8 place-items-center rounded-full border', agentOpen ? 'bg-amber-200/20 border-amber-200/40 text-amber-100' : 'bg-[color:var(--surface-raised)] border-transparent')}
          aria-label="Toggle agent"
        >
          <MessageCircle size={14} />
        </button>
      </div>
    </header>
  );
}
