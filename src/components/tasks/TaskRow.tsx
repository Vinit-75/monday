import { Check, Clock, MoreHorizontal, Sparkles, UserCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { db } from '../../db/db';
import { agent } from '../../ai/agent';
import type { Project, Task } from '../../lib/types';

const PRIORITY_COLOR: Record<number, string> = {
  1: 'bg-rose-400/80',
  2: 'bg-amber-300/80',
  3: 'bg-sky-300/80',
  4: 'bg-transparent',
};

export default function TaskRow({ task, project }: { task: Task; project?: Project }) {
  const [bloom, setBloom] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isDone = task.state === 'done';
  const working = task.state === 'agent_working';
  const needs = task.state === 'needs_you';

  async function toggleDone() {
    if (!isDone) {
      setBloom(true);
      await db.tasks.update(task.id, { state: 'done', completedAt: new Date().toISOString() });
      setTimeout(() => setBloom(false), 700);
    } else {
      await db.tasks.update(task.id, { state: 'todo', completedAt: null });
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={clsx(
        'relative flex items-start gap-3 rounded-xl bg-[color:var(--surface-raised)] px-3 py-2.5 ring-1 ring-[color:var(--border-soft)] transition',
        working && 'ring-amber-200/20',
        needs && 'ring-amber-200/40'
      )}
    >
      {working && <span className="agent-ring rounded-xl" />}

      <button
        onClick={toggleDone}
        className={clsx(
          'relative mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition',
          isDone
            ? 'bg-brand-primary border-brand-primary text-white'
            : 'border-[color:var(--border-ring)] hover:bg-[color:var(--surface-raised)]'
        )}
        aria-label={isDone ? 'Mark incomplete' : 'Complete'}
      >
        {isDone && <Check size={12} />}
        <AnimatePresence>
          {bloom && (
            <motion.span
              key="b"
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55 }}
              className="absolute inset-0 rounded-full bg-brand-lavender/60"
            />
          )}
        </AnimatePresence>
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className={clsx('inline-block h-1.5 w-1.5 rounded-full', PRIORITY_COLOR[task.priority])} />
          <div className={clsx('truncate text-[14px]', isDone && 'strike')}>{task.title}</div>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[color:var(--text-faint)]">
          {project && (
            <span className="inline-flex items-center gap-1">
              <span>{project.emoji}</span>
              <span>{project.name}</span>
            </span>
          )}
          {task.due && (
            <span className="inline-flex items-center gap-1 mono">
              <Clock size={10} /> {format(new Date(task.due), 'MMM d, p')}
            </span>
          )}
          {task.tags.map((t) => <span key={t} className="mono">#{t}</span>)}
          {working && <span className="mono text-amber-200/90">· Agent is on it</span>}
          {needs && <span className="mono text-amber-200/90">· Needs you</span>}
        </div>

        {needs && task.agent?.output && (
          <div className="mt-2 rounded-lg bg-amber-200/10 px-2.5 py-1.5 text-[12px] text-amber-50 ring-1 ring-amber-200/20">
            <div className="mono text-[10px] text-amber-200/80 mb-0.5">Agent output</div>
            {task.agent.output}
            <div className="mt-2 flex gap-2">
              <button
                className="btn btn-ghost !py-1 !px-2 text-[11px]"
                onClick={() => db.tasks.update(task.id, { state: 'todo', agent: null })}
              >
                Looks good
              </button>
              <button
                className="btn btn-ghost !py-1 !px-2 text-[11px]"
                onClick={() => agent.runOnTask({ ...task }, 'research')}
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-7 w-7 place-items-center rounded-md opacity-50 hover:opacity-100 hover:bg-[color:var(--surface-raised)]"
          aria-label="Task actions"
        >
          <MoreHorizontal size={13} />
        </button>
        {menuOpen && (
          <div className="glass-strong absolute right-0 top-9 z-30 w-44 rounded-xl p-1 text-[12px]">
            <MenuItem icon={<Sparkles size={12} />} label="Research for me" onClick={() => { agent.runOnTask(task, 'research'); setMenuOpen(false); }} />
            <MenuItem icon={<Sparkles size={12} />} label="Draft for me" onClick={() => { agent.runOnTask(task, 'draft'); setMenuOpen(false); }} />
            <MenuItem icon={<UserCircle2 size={12} />} label="Schedule for me" onClick={() => { agent.runOnTask(task, 'plan'); setMenuOpen(false); }} />
            <div className="my-1 h-px bg-[color:var(--border-soft)]" />
            <MenuItem icon={<Clock size={12} />} label="Delete" onClick={async () => { await db.tasks.delete(task.id); setMenuOpen(false); }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MenuItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-[color:var(--surface-raised)]">
      <span className="opacity-70">{icon}</span>
      <span>{label}</span>
    </button>
  );
}
