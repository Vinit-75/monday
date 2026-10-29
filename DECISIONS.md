# Agent1 Decisions

Short records of the choices that matter. Each has a reason and a trigger to revisit it.

## D1. Build a personal student deadline tool, not a generic AI agent
- **Why:** I am the user. Academic deadlines are a real, sharp pain, and a generic task manager has no edge over Google Tasks or Todoist.
- **Revisit when:** 5+ other people use it weekly without being nagged.

## D2. Android SpeechRecognizer first, Groq Whisper as the free fallback
- **Why:** Android's recognizer is free, keyless and works offline when the on-device recognizer exists. Groq's free Whisper is a generous cloud fallback for failed or low-confidence clips.
- **Risk:** Hinglish (mid-sentence Hindi-English switching) is where recognizers fail. Test with 30 real recordings before trusting it.
- **Revisit when:** tests show frequent date errors. Then try Sarvam (₹100 free credit), then consider a Whisper fine-tune.

## D3. Rules parser first, Gemini Flash-Lite fallback, text only
- **Why:** rules are free, instant and offline and cover most commands. The LLM handles ambiguous ones. Sending text, not audio, keeps the exposure small.
- **Rule:** pass the current date, time and timezone to the LLM, or "Friday" resolves wrongly.
- **Revisit when:** the free tier's limits or terms change.

## D4. No raw email through free-tier LLMs
- **Why:** the Gemini free tier may use inputs to improve Google's models.
- **Rule:** email extraction is rules-only in Phase 1. If LLM help is needed later, use the paid tier or send a stripped snippet.

## D5. Confirm before saving every task
- **Why:** a misheard date silently saved is worse than no task.

## D6. Room is the source of truth; no Google Tasks sync in Phase 1
- **Why:** sync and conflict handling is a time sink. Use stable task IDs now so a one-way mirror to Google Tasks can be added later.
- **Revisit when:** I miss seeing tasks outside the app.

## D7. Interfaces on every external dependency
- **Why:** `SpeechInput`, `LlmClient` and `TaskStore` let me swap providers by changing one class. Free tiers change; Wispr Flow's free Android limit changed twice in about a month.

## D8. Do not integrate Wispr Flow
- **Why:** no official public API that an Android app can call. The only integration found is an unofficial reverse-engineered Python SDK that depends on a Windows desktop session and may break.
- **Alternative:** the input is a normal text field, so any dictation keyboard works with zero integration code.

## D9. No on-device Whisper or fine-tuning in Phase 1
- **Why:** building and shipping a model is weeks of work and the deadline list is the actual value.
- **Instead:** log transcripts with corrections from day one. After about 500-1000 pairs, try a LoRA fine-tune of Whisper-Small and compare it against the free option.

## D10. Monorepo, third-party code as Gradle dependencies
- **Why:** one clone and one issue list suit a solo developer. Most third-party repos are demos or Python tools, not libraries to embed.
- **Revisit when:** a piece (a published dataset, a reusable `SpeechInput` library) needs its own life.

## D11. Google OAuth in testing mode
- **Why:** up to 100 test users covers me and classmates without verification. Expect weekly re-sign-in because refresh tokens expire after 7 days.
- **Revisit when:** real users appear. Then do verification.

## D12. Languages: English, Hindi, Hinglish
- **Why:** these are the languages I actually speak and type. German is dropped from scope.
- **Consequence:** date rules must cover Devanagari and romanized forms ("kal", "parso", "Friday tak", "कल तक").
