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
          <button onClick={onBegin} className="btn btn-primary !py-1.5 !px-4 text-xs">
            Open app
          </button>
        </div>
      </nav>

      <section className="relative mx-auto flex h-full max-w-6xl flex-col items-center justify-start pt-32 text-center">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 -z-10 h-[560px] w-[1100px] -translate-x-1/2 rounded-[50%]"
          style={{
            background:
              'radial-gradient(closest-side, rgba(0,0,0,0.55), rgba(0,0,0,0.25) 55%, rgba(0,0,0,0) 72%)',
            filter: 'blur(10px)',
          }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.55),0_1px_2px_rgba(0,0,0,0.4)]"
        >
          <span className="block font-sans font-black tracking-tight text-[72px] leading-[0.95] sm:text-[96px] md:text-[128px]">
            Deadlines,
          </span>
          <span className="display-italic block text-[72px] leading-[0.95] sm:text-[96px] md:text-[128px]">
            spoken or typed.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-6 max-w-xl text-white/90 text-base md:text-lg leading-relaxed [text-shadow:0_1px_12px_rgba(0,0,0,0.6)]"
        >
          Capture a task, get reminded at 3 days, 1 day and 3 hours, and pull university mail and calendar when you sign in. Nothing is simulated.
        </motion.p>

        <motion.button
          onClick={onBegin}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="btn btn-primary mt-8 !py-3 !px-6 text-sm"
        >
          Enter the app
          <ArrowRight size={16} />
        </motion.button>
      </section>
    </main>
  );
}
