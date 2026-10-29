// Stub agent — same interface we'll implement against OpenAI/Claude later.
// Everything the UI consumes goes through here.

import { nanoid } from 'nanoid';
import { db } from '../db/db';
import type { Task, ChatMessage } from '../lib/types';
import { parseCapture } from '../lib/nlp';

const now = () => new Date().toISOString();

const CANNED_REPLIES: Record<string, string[]> = {
  default: [
    "Here's what I'm seeing: 4 tasks for today, 2 overdue. Want me to re-prioritize?",
    "I can take that one — researching now.",
    "Done. Dropped the draft into the task notes.",
    "I’d start with the quarterly review. Smaller stuff can wait.",
  ],
  plan: [
    "Blocked out 9–11am for the quarterly review, 2–3pm for Priya’s reply, 6pm for mom. Does that work?",
  ],
  research: [
    "Pulled 3 options under a 15-minute walk, each under $30/person. Dropped them into the task.",
  ],
  draft: [
    "Draft is in the notes. Keeping tone warm but direct. Say the word and I’ll send it.",
  ],
};

function canned(category: keyof typeof CANNED_REPLIES = 'default'): string {
  const bucket = CANNED_REPLIES[category];
  return bucket[Math.floor(Math.random() * bucket.length)];
}

export interface AgentReply {
  text: string;
  category: 'default' | 'plan' | 'research' | 'draft';
}

export const agent = {
  async ask(input: string, _ctx?: unknown): Promise<AgentReply> {
    await delay(400 + Math.random() * 600);
    const lower = input.toLowerCase();
    let category: AgentReply['category'] = 'default';
    if (/plan|schedul|order|priorit/.test(lower)) category = 'plan';
    else if (/find|look up|research|options|recommend/.test(lower)) category = 'research';
    else if (/draft|write|reply|email/.test(lower)) category = 'draft';
    return { text: canned(category), category };
  },

  async captureFromText(text: string, projectHint?: string | null): Promise<Task> {
    const parsed = parseCapture(text);
    const projectId = await resolveProject(parsed.projectHint ?? projectHint ?? null);
    const t = now();
    const task: Task = {
      id: nanoid(10),
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
      order: Date.now(),
      createdAt: t, updatedAt: t, completedAt: null,
    };
    await db.tasks.add(task);
    return task;
  },

  async runOnTask(task: Task, kind: 'research' | 'draft' | 'plan'): Promise<void> {
    await db.tasks.update(task.id, {
      state: 'agent_working',
      updatedAt: now(),
      agent: {
        status: 'working',
        lastMessage: kind === 'research' ? 'Looking things up…' : kind === 'draft' ? 'Drafting…' : 'Planning…',
        output: null,
        startedAt: now(),
      },
    });

    await delay(2200 + Math.random() * 1600);
    const outputs = {
      research: 'Three options worth looking at — details in the notes.',
      draft: 'Draft ready — short, warm, direct.',
      plan: 'Scheduled for a 45-min block tomorrow morning.',
    };
    await db.tasks.update(task.id, {
      state: 'needs_you',
      updatedAt: now(),
      agent: {
        status: 'needs_you',
        lastMessage: 'Done — needs your approval.',
        output: outputs[kind],
        startedAt: now(),
      },
    });
  },
};

async function resolveProject(hint: string | null): Promise<string | null> {
  if (!hint) return null;
  const projects = await db.projects.toArray();
  const found = projects.find((p) => p.name.toLowerCase().startsWith(hint.toLowerCase()));
  return found?.id ?? null;
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function sendChat(text: string): Promise<ChatMessage[]> {
  const t = now();
  const userMsg: ChatMessage = { id: nanoid(10), role: 'user', text, createdAt: t };
  await db.messages.add(userMsg);
  const reply = await agent.ask(text);
  const agentMsg: ChatMessage = { id: nanoid(10), role: 'agent', text: reply.text, createdAt: now() };
  await db.messages.add(agentMsg);
  return [userMsg, agentMsg];
}
