import { nanoid } from 'nanoid';
import { format } from 'date-fns';
import { db } from '../db/db';
import { taskStore } from '../db/taskStore';
import { llmClient } from '../core/llmClient';
import { parseUtterance } from '../lib/parser';
import { parseCapture } from '../lib/nlp';
import { fuzzyFindTask } from '../core/voice';
import { groupDeadlines } from '../lib/parser';
import type { Task, ChatMessage } from '../lib/types';

const now = () => new Date().toISOString();

export interface AgentReply {
  text: string;
  category: 'default' | 'plan' | 'research' | 'draft';
}

export const agent = {
  async ask(input: string, _ctx?: unknown): Promise<AgentReply> {
    const tasks = await db.tasks.toArray();
    const parsed = parseUtterance(input);
    if (parsed.intent === 'query_week') {
      return { text: weekSummary(tasks), category: 'default' };
    }
    if (parsed.intent === 'complete') {
      const hit = fuzzyFindTask(tasks, parsed.completeQuery || parsed.title);
      if (hit) {
        await taskStore.complete(hit.id);
        return { text: `Marked done: ${hit.title}`, category: 'default' };
      }
      return { text: `I couldn't find “${parsed.completeQuery || parsed.title}” in your open tasks.`, category: 'default' };
    }
    if (parsed.intent === 'add' && parsed.title && (parsed.due || parsed.confidence >= 0.65)) {
      const cap = parseCapture(input);
      const task = await taskStore.add({
        title: cap.title,
        notes: '',
        projectId: null,
        tags: cap.tags,
        priority: cap.priority,
        due: cap.due,
        reminders: [],
        recurrence: null,
        parentId: null,
        estimateMinutes: null,
        state: 'todo',
        agent: null,
        completedAt: null,
        source: 'manual',
        sourceRef: null,
        confidence: cap.confidence ?? parsed.confidence,
        needsReview: cap.needsReview ?? parsed.needsReview,
      });
      const when = task.due ? ` · ${format(new Date(task.due), 'EEE d MMM, p')}` : '';
      return { text: `Saved: ${task.title}${when}`, category: 'default' };
    }

    const llm = await llmClient.generate(chatPrompt(input, tasks));
    if (llm) return { text: llm, category: 'default' };
    return { text: localAnswer(input, tasks), category: 'default' };
  },

  async captureFromText(text: string, projectHint?: string | null, source: Task['source'] = 'manual'): Promise<Task> {
    const parsed = parseCapture(text);
    const projectId = await resolveProject(parsed.projectHint ?? projectHint ?? null);
    return taskStore.add({
      title: parsed.title,
      notes: '',
      projectId,
      tags: parsed.tags,
      priority: parsed.priority,
      due: parsed.due,
      reminders: [],
      recurrence: null,
      parentId: null,
      estimateMinutes: null,
      state: 'todo',
      agent: null,
      completedAt: null,
      source,
      sourceRef: null,
      confidence: parsed.confidence ?? 1,
      needsReview: parsed.needsReview ?? false,
    });
  },

  async runOnTask(task: Task, kind: 'research' | 'draft' | 'plan'): Promise<void> {
    await db.tasks.update(task.id, {
      state: 'agent_working',
      updatedAt: now(),
      agent: {
        status: 'working',
        lastMessage: kind === 'research' ? 'Breaking this down…' : kind === 'draft' ? 'Drafting notes…' : 'Scheduling…',
        output: null,
        startedAt: now(),
      },
    });

    if (kind === 'plan') {
      const due = task.due ? new Date(task.due) : new Date();
      if (!task.due) {
        due.setDate(due.getDate() + 1);
        due.setHours(9, 0, 0, 0);
      }
      const iso = due.toISOString();
      await taskStore.update(task.id, {
        due: iso,
        state: 'todo',
        agent: {
          status: 'done',
          lastMessage: `Scheduled ${format(due, 'EEE d MMM, p')}`,
          output: `Due set to ${format(due, 'EEEE d MMMM, p')}. Reminders will fire 3 days, 1 day and 3 hours before.`,
          startedAt: now(),
        },
      });
      return;
    }

    const prompt = kind === 'research'
      ? `Student deadline: "${task.title}". Due: ${task.due ?? 'unset'}. List 3 concrete next actions, one line each. No fluff.`
      : `Write a short draft the student can paste for: "${task.title}". Keep it under 80 words.`;
    const llm = await llmClient.generate(prompt);
    const output = llm ?? localBreakdown(task.title, kind);
    await taskStore.update(task.id, {
      notes: [task.notes, output].filter(Boolean).join('\n\n'),
      state: 'needs_you',
      agent: {
        status: 'needs_you',
        lastMessage: 'Ready — check the notes.',
        output,
        startedAt: now(),
      },
    });
  },
};

export async function sendChat(text: string): Promise<ChatMessage[]> {
  const t = now();
  const userMsg: ChatMessage = { id: nanoid(10), role: 'user', text, createdAt: t };
  await db.messages.add(userMsg);
  const reply = await agent.ask(text);
  const agentMsg: ChatMessage = { id: nanoid(10), role: 'agent', text: reply.text, createdAt: now() };
  await db.messages.add(agentMsg);
  return [userMsg, agentMsg];
}

function weekSummary(tasks: Task[]): string {
  const g = groupDeadlines(tasks);
  const lines = g.thisWeek.slice(0, 8).map((t) => `• ${t.title}${t.due ? ` (${format(new Date(t.due), 'EEE p')})` : ''}`);
  if (g.thisWeek.length === 0) return 'Nothing due this week.';
  return `${g.thisWeek.length} due this week:\n${lines.join('\n')}`;
}

function localAnswer(input: string, tasks: Task[]): string {
  const open = tasks.filter((t) => t.state !== 'done');
  const g = groupDeadlines(open);
  const lower = input.toLowerCase();
  if (/overdue/.test(lower)) {
    if (!g.overdue.length) return 'Nothing overdue.';
    return `Overdue (${g.overdue.length}):\n${g.overdue.map((t) => `• ${t.title}`).join('\n')}`;
  }
  if (/first|priorit|today|start/.test(lower)) {
    const next = [...g.overdue, ...g.thisWeek][0];
    if (!next) return 'Your list is clear. Add a deadline when you have one.';
    return `Start with: ${next.title}${next.due ? ` · ${format(new Date(next.due), 'EEE p')}` : ''}`;
  }
  return `Open: ${open.length}. Overdue ${g.overdue.length}, this week ${g.thisWeek.length}, later ${g.upcoming.length}. Say a deadline to save it, or ask what's due this week.`;
}

function localBreakdown(title: string, kind: 'research' | 'draft'): string {
  if (kind === 'draft') {
    return `Re: ${title}\n\nHi — flagging this deadline. I’ll send the work by the due time. Let me know if the scope changed.`;
  }
  return `1. Confirm the exact due time for “${title}”.\n2. Gather what’s already done.\n3. Finish the remaining piece and submit.`;
}

function chatPrompt(input: string, tasks: Task[]): string {
  const open = tasks.filter((t) => t.state !== 'done').slice(0, 30).map((t) => ({
    title: t.title,
    due: t.due,
    source: t.source,
  }));
  return `You help one student with their deadlines. Use only this list. Do not invent tasks.
Now: ${new Date().toISOString()} tz ${Intl.DateTimeFormat().resolvedOptions().timeZone}
Tasks: ${JSON.stringify(open)}
User: ${input}
Reply in 1-6 short sentences. If they named a new deadline, say you need them to type it in capture so it saves locally.`;
}

async function resolveProject(hint: string | null): Promise<string | null> {
  if (!hint) return null;
  const projects = await db.projects.toArray();
  const byId = projects.find((p) => p.id === hint);
  if (byId) return byId.id;
  const found = projects.find((p) => p.name.toLowerCase().startsWith(hint.toLowerCase()));
  return found?.id ?? null;
}
