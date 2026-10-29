import { groupDeadlines } from '../../lib/parser';
import TaskRow from './TaskRow';
import type { Project, Task } from '../../lib/types';

export default function DeadlineList({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const open = tasks.filter((t) => t.state !== 'done');
  const grouped = groupDeadlines(open);
  const buckets: { key: string; label: string; items: Task[] }[] = [
    { key: 'overdue', label: 'Overdue', items: grouped.overdue },
    { key: 'week', label: 'Due this week', items: grouped.thisWeek },
    { key: 'later', label: 'Upcoming', items: grouped.upcoming },
  ];

  return (
    <div className="space-y-6">
      {buckets.map((b) => (
        <section key={b.key}>
          <div className="mono mb-2 px-1 text-[10px] uppercase tracking-wider text-[color:var(--text-faint)]">
            {b.label} · {b.items.length}
          </div>
          {b.items.length === 0 ? (
            <div className="px-1 text-sm text-[color:var(--text-faint)]">Nothing here.</div>
          ) : (
            <div className="space-y-2">
              {b.items.map((t) => (
                <TaskRow key={t.id} task={t} project={t.projectId ? projectMap[t.projectId] : undefined} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
