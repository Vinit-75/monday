import TaskRow from './TaskRow';
import type { Project, Task, TaskState } from '../../lib/types';

const COLS: { key: TaskState; label: string; hint: string }[] = [
  { key: 'todo', label: 'To do', hint: 'Still ahead' },
  { key: 'doing', label: 'Doing', hint: 'In motion' },
  { key: 'agent_working', label: 'Agent', hint: 'On it' },
  { key: 'needs_you', label: 'Needs you', hint: 'Awaiting approval' },
  { key: 'done', label: 'Done', hint: 'Finished' },
];

export default function TaskBoard({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));

  return (
    <div className="flex h-full gap-3 overflow-x-auto pb-4">
      {COLS.map((col) => {
        const items = tasks.filter((t) => t.state === col.key);
        return (
          <div key={col.key} className="flex min-w-[260px] max-w-[300px] flex-1 flex-col">
            <div className="flex items-baseline justify-between px-1 pb-2">
              <div>
                <div className="font-sans text-sm font-medium">{col.label}</div>
                <div className="mono text-[10px] text-[color:var(--text-faint)]">{col.hint}</div>
              </div>
              <span className="mono text-[11px] text-[color:var(--text-faint)]">{items.length}</span>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto rounded-xl bg-[color:var(--surface-raised)] p-2 ring-1 ring-[color:var(--border-soft)]">
              {items.length === 0 ? (
                <div className="grid h-20 place-items-center text-[11px] text-[color:var(--text-faint)]">
                  nothing here
                </div>
              ) : items.map((t) => (
                <TaskRow key={t.id} task={t} project={t.projectId ? projectMap[t.projectId] : undefined} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
