import { AnimatePresence } from 'framer-motion';
import TaskRow from './TaskRow';
import type { Project, Task } from '../../lib/types';

export default function TaskList({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const active = tasks.filter((t) => t.state !== 'done');
  const done = tasks.filter((t) => t.state === 'done');

  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {active.map((t) => (
          <TaskRow key={t.id} task={t} project={t.projectId ? projectMap[t.projectId] : undefined} />
        ))}
      </AnimatePresence>
      {done.length > 0 && (
        <>
          <div className="mono mt-6 mb-2 px-1 text-[10px] uppercase tracking-wider text-[color:var(--text-faint)]">
            Done · {done.length}
          </div>
          <AnimatePresence initial={false}>
            {done.map((t) => (
              <TaskRow key={t.id} task={t} project={t.projectId ? projectMap[t.projectId] : undefined} />
            ))}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
