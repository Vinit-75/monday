# Hush — Android (Jetpack Compose)

Native Android port of the Hush web app. Same supaste visual language
(rolling-hills wallpaper, Instrument Serif + Inter + Fragment Mono,
glass panels, indigo accents), same agent-first task UX.

## Open it

1. Open **Android Studio Ladybug** or newer.
2. **File → Open…** → pick this `android/` folder.
3. Android Studio will auto-generate the Gradle wrapper, download
   dependencies, and sync. First sync takes a few minutes.
4. Pick an emulator (API 26+ / Android 8+) or a physical device.
5. Hit **Run** (⌃R / Shift+F10).

## Requirements

- **Android Studio** Ladybug (2024.2) or newer
- **JDK 17** (bundled with Android Studio)
- **Android SDK 35** (Android Studio will install this on sync)
- Min SDK: 26 (Android 8, 2017+ — ~97% of devices)

## What's in it

| Area | Details |
|------|---------|
| Theming | Material 3 color scheme matching supaste tokens (indigo `#5F61ED`, ink `#0D0D0D`, paper `#F7F7F7`) |
| Typography | Instrument Serif (display), Inter (body), Fragment Mono (meta) — bundled as `res/font/*.ttf` |
| Wallpaper | `assets/hills.jpg` + a sky gradient + aurora blobs + procedural grain overlay |
| Glass panels | `GlassSurface` composable — tinted translucent fill with inner border |
| Agent ring | `AgentRing` — animated conic gradient stroke on a rounded rect |
| Persistence | Room (`HushDatabase`) with Task / Project / Message entities, seeded on first run |
| State | `kotlinx.coroutines` Flow + `collectAsState`; no DI framework (manual wiring via `HushApp.repo`) |
| Screens | `LandingScreen` (first-run), `HomeScreen` (bottom nav + raised mic FAB), `TaskRow`, `AgentSheet`, `NavDrawer`, `QuickCaptureBar` |
| AI | Stubbed in `AgentStub.kt` — same interface the real one will implement; voice capture is UI-only (SpeechRecognizer wiring is a 1-day job to add) |

## Project layout

```
android/
├── settings.gradle.kts           ← root settings
├── build.gradle.kts              ← plugin versions
├── app/
│   ├── build.gradle.kts          ← app module, deps
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── assets/hills.jpg
│       ├── res/
│       │   ├── font/*.ttf        ← Instrument Serif, Inter, Fragment Mono
│       │   ├── values/colors.xml, strings.xml, themes.xml
│       │   ├── drawable/ic_launcher_foreground.xml
│       │   └── mipmap-anydpi-v26/ic_launcher*.xml
│       └── java/com/hush/todo/
│           ├── HushApp.kt            ← Application
│           ├── MainActivity.kt       ← Compose root
│           ├── ai/AgentStub.kt
│           ├── data/
│           │   ├── HushDatabase.kt, Daos.kt, Repo.kt, Seed.kt
│           │   └── entities/Entities.kt
│           └── ui/
│               ├── theme/            ← Color, Type, Theme
│               ├── components/       ← Wallpaper, GlassSurface, AgentRing
│               └── screens/          ← Landing, Home, TaskRow, AgentSheet,
│                                       NavDrawer, QuickCaptureBar
```

## Next steps

- **Voice**: wire `android.speech.SpeechRecognizer` behind the mic FAB
  callback in `HomeScreen.onMic` (needs `RECORD_AUDIO` permission, already
  declared in the manifest).
- **AI backend**: swap `AgentStub` for a real OpenAI/Claude-backed
  implementation. The interface is intentionally narrow:
  `chat(text)`, `runOnTask(task, kind)`, `parseCapture(raw) → TaskEntity`.
- **Projects detail view**: list is navigable but the dedicated
  per-project screen is a next-iteration task.
- **Themes**: dark is the default and matches system; light theme is
  wired but a toggle UI isn't shipped yet.
