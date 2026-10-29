# Agent1 Architecture (Phase 1)

A personal student deadline tool for Android. User #1 is me. Every feature has to pass one test: does it save me time this week?

Languages: English, Hindi, Hinglish.
Budget: ₹0. No laptop dependency.

## Principles

1. **The model proposes, code executes.** An LLM may suggest a task; only app code writes to the database.
2. **Secrets never enter prompts.** OAuth tokens and API keys stay in code and encrypted storage.
3. **Everything external sits behind an interface** (`SpeechInput`, `LlmClient`, `TaskStore`) so any provider can be swapped in one class. Free tiers change often.
4. **Every stage has a timeout and a fallback.** A failure degrades to the next layer, never to a crash.
5. **Confirm before saving.** Voice and extraction make mistakes; the user approves every task.
6. **Local-first.** Room is the source of truth.

## Flow

```
Push-to-talk
   |
   v
[1] Android SpeechRecognizer (hi-IN / en-IN toggle, on-device when available)
   |  empty, garbled or low confidence?  -> [2]
   v
[2] Groq free Whisper (same audio clip, 5 s timeout)
   |  rate-limited or offline? -> show transcript as editable text
   v
Transcript text
   |
   v
[3] Rules parser (English / Hindi / Hinglish dates, device clock + timezone)
   |  low confidence? -> [4]
   v
[4] Gemini Flash-Lite free tier (text only -> JSON: intent, title, due, confidence)
   |  offline or failed? -> keep raw text, mark "needs review"
   v
Confirmation card: "Submit DBMS assignment, Fri 31 Oct, 11:59 PM"  [Save] [Edit]
   v
Room (source of truth) -> WorkManager notifications (3 days, 1 day, 3 hours)
```

Typed input and any dictation keyboard also work, because the input is a normal text field.

## Stack

| Layer | Choice |
|---|---|
| Language / UI | Kotlin, Jetpack Compose |
| Storage | Room |
| Reminders | WorkManager |
| Voice input | Android SpeechRecognizer behind `SpeechInput` |
| STT fallback | Groq-hosted Whisper, free plan |
| Parsing | Rules first, Gemini Flash-Lite fallback behind `LlmClient` |
| Email / Calendar | Gmail and Calendar read-only scopes, Google testing mode |

## Free-tier facts (as of Oct 2026, verify before relying on them)

- Groq free Whisper: about 20 requests per minute, 2,000 per day, 28,800 audio seconds per day. Check your own console; sources differ.
- Gemini free tier: Flash and Flash-Lite are free; per-model limits are shown in AI Studio. Free-tier inputs and outputs may be used by Google to improve its products.
- Google OAuth testing mode: up to 100 test users, refresh tokens expire after 7 days, so expect to sign in again about weekly.
- Sarvam AI (optional): ₹100 free credits, then ₹30 per hour of audio. Use only if Hinglish tests fail.

## Email handling

- Read-only scopes only.
- Extract only from filtered senders (university domain).
- **Rules only** on email text in Phase 1. Do not send raw email to free-tier LLMs.
- Never log full email bodies.

## API keys

Do not hardcode keys in the APK. For personal use, enter the key once in a settings screen and keep it in encrypted storage. If classmates join, put a small free serverless proxy in front.

## Data worth logging from day one

Store each voice transcript with the corrected text locally. It shows which phrases the rules miss and is free training data if I ever fine-tune Whisper.

## Repo layout (monorepo)

```
agent1/
  app/    Android app
  tools/  Python eval scripts (STT comparison, dateparser checks)
  docs/   ARCHITECTURE.md, DECISIONS.md, ROADMAP.md
```

Keep models, audio and datasets out of git. Use Gradle dependencies for third-party libraries.

## Build order

1. Week 1: project skeleton, Room, WorkManager notifications, manual task entry.
2. Week 2: Calendar and Gmail read, rules-based deadline extraction, one-screen list.
3. Week 3: push-to-talk with Android recognizer, rules parser for voice commands, confirmation card.
4. Week 4: Groq and Gemini fallbacks behind the interfaces, then daily use.

Before week 3, record 30 test sentences (Hindi, English, Hinglish) and run them through each layer. If Android's recognizer plus rules handles most, layers [2] and [4] can wait.

## Out of scope for Phase 1

Generic orchestrator, durable run store, policy engine, model routing, on-device Whisper, Whisper fine-tuning, Google Tasks sync, wake words, background listening, Wispr Flow integration.
