import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Landing({ onBegin }: { onBegin: () => void }) {
  return (
    <main className="relative z-10 h-full w-full overflow-hidden">
      <nav className="absolute left-1/2 top-6 z-20 -translate-x-1/2">
        <div className="glass-strong flex items-center gap-6 rounded-full px-6 py-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-ink grid place-items-center">
              <span className="display-italic text-white text-sm leading-none pt-0.5">h</span>
            </div>
            <span className="font-medium">Hush</span>
          </div>
          <div className="hidden items-center gap-5 text-white/70 md:flex">
            <a className="hover:text-white">Features</a>
            <a className="hover:text-white">Agent</a>
            <a className="hover:text-white">Pricing</a>
            <a className="hover:text-white">FAQ</a>
          </div>
          <button onClick={onBegin} className="btn btn-primary !py-1.5 !px-4 text-xs">
            Open app
          </button>
        </div>
      </nav>

      <section className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-start pt-32 text-center">
        {/* Soft radial scrim so the display text reads on any background */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[560px] w-[1100px] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 72%)',
            filter: 'blur(10px)',
          }}
        />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="chip mb-6 !bg-white/15 !border-white/25 !text-white/90 backdrop-blur-md"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-lavender" />
          AI-powered to-do · solo
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          className="text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.4)]"
        >
          <span className="block font-sans font-black tracking-tight text-[72px] leading-[0.95] sm:text-[96px] md:text-[128px]">
            Just say it.
          </span>
          <span className="display-italic block text-[72px] leading-[0.95] sm:text-[96px] md:text-[128px]">
            I'll handle it.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-xl text-white/90 text-base md:text-lg leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]"
        >
          A quietly powerful to-do app with an AI agent that captures, drafts, researches, and
          schedules — so you can get back to doing the one thing that actually matters.
        </motion.p>

        <motion.button
          onClick={onBegin}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="btn btn-primary mt-8 !py-3 !px-6 text-sm"
        >
          Enter the app
          <ArrowRight size={16} />
        </motion.button>

        <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
          <span>Free, local-first</span>
          <span className="opacity-50">·</span>
          <span>No sign-in to try</span>
          <span className="opacity-50">·</span>
          <span>Dark & light themes</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-14 w-full max-w-3xl"
        >
          <AppMock />
        </motion.div>
      </section>
    </main>
  );
}

function AppMock() {
  return (
    <div className="glass-strong relative mx-auto rounded-[22px] p-3 text-left">
      <div className="flex items-center justify-between px-2 py-1 text-[11px] text-white/60">
        <div className="flex items-center gap-1.5">
          <div className="h-5 w-5 rounded-md bg-ink grid place-items-center text-white text-[10px]">h</div>
          <span>Hush</span>
        </div>
        <div className="mono text-white/70">09:41</div>
      </div>
      <div className="mt-2 rounded-[16px] bg-black/40 p-3 ring-1 ring-white/10">
        <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-2 text-[12px] text-white/60">
          <span>⌘</span> <span>Just say what’s on your mind…</span>
        </div>
        <div className="mt-3 flex gap-2 text-[11px]">
          {['Today 4', 'Agent 2', 'Inbox 5', 'Upcoming', 'Projects'].map((t) => (
            <span key={t} className="chip !text-white/85 !bg-white/10 !border-white/15">{t}</span>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[
            { t: 'Draft the quarterly review doc', state: 'agent' },
            { t: 'Call mom', state: 'todo' },
            { t: 'Book a Thai spot for Friday — somewhere quiet', state: 'needs' },
            { t: 'Reply to Priya about Thursday', state: 'todo' },
          ].map((r) => (
            <div key={r.t} className="relative flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
              {r.state === 'agent' && <span className="agent-ring rounded-xl" />}
              <div className={`h-4 w-4 rounded-full ring-1 ${r.state === 'needs' ? 'ring-amber-300/70 bg-amber-200/20' : 'ring-white/30'}`} />
              <div className="flex-1 text-[13px] text-white/90">{r.t}</div>
              {r.state === 'agent' && <span className="text-[10px] mono text-amber-200/90">Agent is on it</span>}
              {r.state === 'needs' && <span className="text-[10px] mono text-amber-200/90">Needs you</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
