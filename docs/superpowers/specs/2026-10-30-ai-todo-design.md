# AI To-Do — Design Document

**Date:** 2026-10-30
**Owner:** sattva.tech.team@gmail.com
**Status:** Awaiting approval

---

## Intent

A solo AI-powered to-do application. Visually, it borrows the dreamy,
cinematic feel of [supaste.com](https://www.supaste.com/) — rolling-hills
hero wallpaper, Instrument Serif display type, Inter body, Fragment Mono
accents, grain overlay, soft shadows. Functionally, it borrows the "AI
agent that actually does the task" idea from twodo.design, but strips out
the couples/two-person aspect: this is a single-user app.

The user talks to the app by voice or text; the app captures tasks, puts
them in the right project, and an AI agent can **chat, prioritize,
research, draft content, and auto-schedule** work. Nothing couple-related.

## Why now

The user wants an elegant personal task app that doesn't feel templated,
and wants to see how an AI agent integrated at the UX level (not bolted on)
can change how task management feels.

## Goals

1. **Pixel-adjacent to supaste** in look and feel — the rolling-hills hero,
   Instrument Serif headlines, grain, soft gradients, generous spacing,
   indigo brand accents. Not a one-to-one clone; a convincing twin.
2. **Full to-do feature set** — projects, task fields (due date, priority,
   subtasks, recurrence, reminders, notes, tags), multiple views (today,
   inbox, upcoming, list, board/kanban, calendar), swipe-to-complete with
   bloom animation, quick-capture, keyboard shortcuts, markdown in notes.
3. **AI agent surfaces** built into the UX from day one, even if the actual
   AI backend is stubbed:
   - **Voice capture**: tap the mic, speak, task is parsed into the right
     fields and project.
   - **Chat drawer**: 1-to-1 conversation with an AI about your tasks.
   - **Agent states on tasks**: "Agent is on it" (animated gold ring),
     "Needs you", "Done" — carried over from twodo.
   - **Agent actions**: research & draft, auto-schedule, break down a goal
     into subtasks, prioritize the day.
4. **Supabase cloud sync** — tasks, projects, user settings in Postgres,
   with Supabase Auth for sign-in. Local-first adapter in front so the app
   also works offline.
5. **Dark ("Evening") and light ("Paper") themes**, dark default.
6. **Responsive** — desktop-first, works on tablet, usable on phone.

## Non-goals (v1)

- Native mobile app (web/PWA only)
- Real-time multi-user collaboration or sharing
- Mobile voice assistants / Siri / shortcuts integration
- Calendar provider sync (Google Cal, iCal) — placeholder only
- Email integration
- Attachments / file uploads

## Anti-goals (would make this a failure even if it works)

- Looks "templated" — generic SaaS dashboard, bland palette, no soul
- The AI feels bolted on (a floating chat bubble, not integrated)
- Supaste visuals copied so literally the user can't recognize themself
  in it (e.g. we keep Supaste's actual mascot or copy)
- Feature creep from twodo's couples-coordination model leaking in
  (shared approval, per-partner colors, "Waiting on [name]")

## Visual direction

Pulled directly from supaste.com's live assets and CSS:

| Token | Value | Role |
|------|-------|------|
| `--bg-wallpaper` | rolling-hills image + grain overlay | Hero / landing |
| `--surface-ink` | `#0d0d0d` | Dark theme base |
| `--surface-paper` | `#f7f7f7` | Light theme base |
| `--brand-primary` | `#5f61ed` | Primary indigo (buttons, focus) |
| `--brand-blue` | `#006fff` | Secondary blue (links, info) |
| `--brand-lavender` | `#9191ff` | Soft accent (tags, chips) |
| `--text-ink` | `#000` on paper / `#fff` on ink | Primary text |
| `--text-mute` | 60% of ink | Secondary text |

**Fonts** (same as supaste, all free/self-hosted):

- **Instrument Serif** — hero headlines, task-complete toasts, section titles
- **Inter Display** — UI headings (18–32px)
- **Inter** — body (14–16px)
- **Fragment Mono** — timestamps, keyboard shortcuts, meta accents

**Signature visual elements:**

1. Hero wallpaper is a cinematic 3D-style rolling-hills landscape with a
   blue-to-warm-sunset sky. Covers the login + landing screens. In the
   app shell, it becomes a soft blurred backdrop behind translucent panels.
2. Subtle grain overlay (~3–5% opacity noise) over everything.
3. Soft radial glows (indigo and warm-peach) behind large elements.
4. Glass panels: `backdrop-filter: blur(24px)` + 1px indigo-tinted border +
   soft inset highlight.
5. **Agent working state** = thin gold ring around a task, slowly rotating
   (SVG gradient stroke, 4s linear infinite). Still border with
   `prefers-reduced-motion`.
6. **Task complete** = strike-through + bloom (small particle burst or
   scale pop), then slide into Done section with undo toast.

## Information architecture

```
App shell
├─ Sidebar (left, 260px, collapsible)
│  ├─ Workspace switcher (future)
│  ├─ Smart lists: Today, Inbox, Upcoming, Someday
│  ├─ Projects (user-created, with emoji + color)
│  ├─ Tags (flat list, filter-only)
│  └─ Settings
├─ Main (center)
│  ├─ View header: title, view switcher (list / board / calendar),
│  │   filter, sort, search
│  ├─ Quick-add bar (always visible, keyboard: `n` focuses it)
│  └─ Content: tasks in the chosen view
└─ Agent dock (right, 360px, toggleable with `a` or voice-tap)
   ├─ Mic button (big, centered when idle)
   ├─ Transcript (chat bubbles, user + agent)
   ├─ Agent-suggested actions (chips)
   └─ Context panel: what the agent sees right now
```

## Task model

```ts
Task {
  id: uuid
  title: string
  notes: string            // markdown
  projectId: uuid | null
  tags: string[]
  priority: 1 | 2 | 3 | 4  // P1 red, P2 orange, P3 blue, P4 none
  due: datetime | null
  reminders: datetime[]
  recurrence: RRULE string | null
  parentId: uuid | null    // for subtasks
  estimateMinutes: number | null
  state: 'todo' | 'doing' | 'done' | 'agent_working' | 'needs_you' | 'blocked'
  agent: {
    status: 'idle' | 'working' | 'done' | 'needs_you'
    lastMessage: string
    output: string | null   // the draft / research result
    startedAt: datetime
  } | null
  createdAt, updatedAt, completedAt
}

Project {
  id, name, emoji, color, archived, sortOrder
}

User {
  id, email, preferences { theme, defaultView, mic enabled, ... }
}
```

## Views

1. **Today** — tasks due today + overdue, grouped by project.
2. **Inbox** — unsorted captures, drag into project.
3. **Upcoming** — 7-day horizontal strip + a list grouped by day.
4. **Project detail** — list / board / calendar switcher.
5. **Agent chat** — standalone full-page conversation with history.

## Interactions

- **Quick add**: inline input, type naturally — "Call mom tomorrow at 5pm
  #personal !p2" — chips preview as the user types.
- **Keyboard shortcuts**: `n` new task, `a` open agent dock, `/` search,
  `t` go to Today, `i` inbox, `cmd+k` command palette.
- **Swipe right on a task row** → complete (desktop: click checkbox).
- **Drag a task** → reorder in list, or drop onto another day in calendar.
- **Click the mic** → agent dock opens, listens, closes on silence.

## AI agent surfaces (UX only in v1)

| Trigger | Behavior | Backend v1 |
|---------|----------|------------|
| Mic tap + speak | Transcript → parsed task shows in Inbox | Stub: regex + fake delay |
| "Research this" on a task | Agent ring spins, outputs a draft | Stub: canned text |
| "Plan my week" | Agent proposes time slots on tasks | Stub: naive scheduler |
| Chat drawer | Free-form conversation | Stub: canned replies with task context |

All AI calls go through `src/ai/agent.ts`, which exports a single
`agent.ask(input, context) → stream` interface. v1 ships a mock
implementation. v2 swaps in OpenAI or Claude without touching the UI.

## Data & sync

- **Schema** created as Supabase migrations in `supabase/migrations/`
- **Supabase Auth** (magic-link email) for sign-in; local dev uses a
  mocked user so you don't need a Supabase project just to see the UI.
- **Client**: `supabase-js`. All reads/writes go through a `TaskRepo`
  interface. Two implementations:
  - `LocalRepo` — IndexedDB via Dexie (default, works offline)
  - `SupabaseRepo` — remote
- A simple **sync layer** reconciles the two when online + signed in.
  v1 scope: last-write-wins, no conflict UI.

## Stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** with a custom theme matching the tokens above
- **Framer Motion** for all the motion (bloom, agent ring, page
  transitions)
- **Dexie** for local persistence
- **@supabase/supabase-js** for cloud
- **Zustand** for app state
- **date-fns** + `rrule.js` for scheduling
- **Lenis** for smooth scroll on the landing hero
- Fonts: Instrument Serif, Inter / Inter Display, Fragment Mono — all
  self-hosted woff2 under `public/fonts/`

## Scope split

**v1 — this build (UI/UX-complete, AI stubbed, local persistence)**
- All views, all interactions, all visual elements, dark + light themes,
  responsive layout
- Agent dock + voice UI + agent states on tasks
- Local persistence (Dexie); Supabase code written but gated behind a
  "Connect cloud" setting that's off by default

**v2 — later (user said "discuss later")**
- Wire real AI backend (OpenAI or Claude)
- Enable Supabase Auth + sync
- Deploy to Vercel

## What the builder gets to decide

- Exact pixel spacing within the design-token system
- The specific animations' durations and easings (within taste)
- Component library organization inside `src/components/`
- Which Lucide/Phosphor icons to use for each action
- Dexie schema version migration code

## What needs the user's call before building

Nothing further. The four questions above are answered, the visual
reference is in hand, the scope is split, the AI is explicitly stubbed.
Ready to approve → write the plan → build.

---

## Approval checklist

Please confirm:

- [ ] This matches what you wanted
- [ ] You're OK building the UI/UX first with AI stubbed (your choice from Q2)
- [ ] You're OK with Supabase deferred until v2 (local-first for v1)
- [ ] No features missing from your mental picture
