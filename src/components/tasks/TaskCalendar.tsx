import { addDays, format, isSameDay, startOfWeek } from 'date-fns';
import TaskRow from './TaskRow';
import type { Project, Task } from '../../lib/types';

export default function TaskCalendar({ tasks, projects }: { tasks: Task[]; projects: Project[] }) {
  const projectMap = Object.fromEntries(projects.map((p) => [p.id, p]));
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="grid h-full grid-cols-7 gap-2">
      {days.map((day) => {
        const dayTasks = tasks.filter((t) => t.due && isSameDay(new Date(t.due), day));
        const isToday = isSameDay(day, new Date());
        return (
          <div key={day.toISOString()} className="flex min-h-0 flex-col rounded-xl bg-[color:var(--surface-raised)] p-2 ring-1 ring-[color:var(--border-soft)]">
            <div className="flex items-baseline justify-between pb-2">
              <div>
                <div className="mono text-[10px] uppercase text-[color:var(--text-faint)]">{format(day, 'EEE')}</div>
                <div className={isToday ? 'display-italic text-[22px] text-brand-lavender' : 'display text-[22px]'}>
                  {format(day, 'd')}
                </div>
              </div>
              {dayTasks.length > 0 && (
                <span className="mono text-[10px] text-[color:var(--text-faint)]">{dayTasks.length}</span>
              )}
            </div>
            <div className="flex-1 space-y-1.5 overflow-y-auto">
              {dayTasks.map((t) => (
                <TaskRow key={t.id} task={t} project={t.projectId ? projectMap[t.projectId] : undefined} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
