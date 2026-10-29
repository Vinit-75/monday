import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo } from 'react';
import { db } from '../../db/db';
import { useAppStore } from '../../stores/app';
import QuickCapture from '../tasks/QuickCapture';
import TaskList from '../tasks/TaskList';
import TaskBoard from '../tasks/TaskBoard';
import TaskCalendar from '../tasks/TaskCalendar';
import DeadlineList from '../tasks/DeadlineList';
import ReviewInbox from '../tasks/ReviewInbox';
import ViewHeader from './ViewHeader';
import type { Task } from '../../lib/types';

export default function Main() {
  const { activeList, viewMode, search } = useAppStore();
  const tasks = useLiveQuery(() => db.tasks.toArray(), []);
  const projects = useLiveQuery(() => db.projects.toArray(), []);

  const filtered = useMemo(() => {
    if (!tasks) return [] as Task[];
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
    let result = tasks;
    if (typeof activeList === 'string') {
      switch (activeList) {
        case 'today':
          result = tasks.filter((t) => t.state !== 'done' && t.due); break;
        case 'inbox':
          result = tasks.filter((t) => !t.projectId && t.state !== 'done'); break;
        case 'upcoming':
          result = tasks.filter((t) => t.state !== 'done' && t.due && new Date(t.due) >= tomorrow); break;
        case 'someday':
          result = tasks.filter((t) => t.state !== 'done' && !t.due); break;
        case 'completed':
          result = tasks.filter((t) => t.state === 'done'); break;
        case 'review':
          result = tasks; break;
      }
    } else if (activeList.kind === 'project') {
      result = tasks.filter((t) => t.projectId === activeList.id);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q));
    }
    return result.sort((a, b) => {
      if (a.state === 'done' && b.state !== 'done') return 1;
      if (b.state === 'done' && a.state !== 'done') return -1;
      if (a.priority !== b.priority) return a.priority - b.priority;
      return (a.due ?? '9999').localeCompare(b.due ?? '9999');
    });
  }, [tasks, activeList, search]);

  const showDeadlines = activeList === 'today' && viewMode === 'list';
  const showReview = activeList === 'review';

  return (
    <section className="glass flex min-w-0 flex-1 flex-col rounded-[20px]">
      <ViewHeader />
      <div className="shrink-0 px-6 pt-4">
        {!showReview && <QuickCapture />}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-6">
        {showReview ? (
          <ReviewInbox />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : showDeadlines ? (
          <DeadlineList tasks={filtered} projects={projects ?? []} />
        ) : viewMode === 'list' ? (
          <TaskList tasks={filtered} projects={projects ?? []} />
        ) : viewMode === 'board' ? (
          <TaskBoard tasks={filtered} projects={projects ?? []} />
        ) : (
          <TaskCalendar tasks={filtered} projects={projects ?? []} />
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div>
        <div className="display text-5xl text-[color:var(--text-mute)]">All quiet.</div>
        <div className="display-italic text-5xl text-[color:var(--text)]">Add one thing.</div>
        <p className="mt-4 text-sm text-[color:var(--text-faint)]">
          Try: <span className="mono rounded bg-[color:var(--surface-raised)] px-1.5 py-0.5">submit DBMS friday 11:59</span>
        </p>
      </div>
    </div>
  );
}
