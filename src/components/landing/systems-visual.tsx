"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

const floatTransition = {
  duration: 8,
  repeat: Infinity,
  ease: "easeInOut",
} as const;

export function SystemsVisual() {
  const prefersReducedMotion = useReducedMotion();
  const panelClassName =
    "rounded-[1.7rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur-sm";

  return (
    <div className="surface-panel relative mx-auto w-full max-w-[34rem] overflow-hidden rounded-[2.4rem] border border-white/10 p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))]" />
      <div className="pointer-events-none absolute inset-0 opacity-28 [background-image:linear-gradient(rgba(255,255,255,0.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:86px_86px] [mask-image:radial-gradient(circle_at_center,black_22%,transparent_75%)]" />
      <div className="pointer-events-none absolute inset-y-36 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-accent/35 to-transparent" />

      <div className="relative flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xs">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-accent">
            Operating layer
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-strong">
            One cleaner flow from first click to follow-up.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/75">
          Built for real operations
        </div>
      </div>

      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [-7, 7, -7] }}
        transition={floatTransition}
        className={cn(panelClassName, "relative mt-8 w-[84%]")}
      >
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent">
          Web presence
        </p>
        <h3 className="mt-4 text-2xl font-semibold text-white">
          Website, search, and lead capture.
        </h3>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted-strong">
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            Fast pages
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            Better inquiries
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            Local visibility
          </span>
        </div>
      </motion.div>

      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [9, -5, 9] }}
        transition={{ ...floatTransition, duration: 9 }}
        className={cn(panelClassName, "relative ml-auto mt-4 w-[78%]")}
      >
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent">
          Operations
        </p>
        <h3 className="mt-4 text-xl font-semibold text-white">
          Booking, intake, reminders, and admin flow.
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-strong">
          Less duplicate entry. Fewer dropped steps.
        </p>
      </motion.div>

      <motion.div
        animate={prefersReducedMotion ? undefined : { y: [-6, 6, -6] }}
        transition={{ ...floatTransition, duration: 10 }}
        className={cn(panelClassName, "relative mt-4 w-[82%]")}
      >
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-accent">
          AI layer
        </p>
        <h3 className="mt-4 text-xl font-semibold text-white">
          FAQ handling, drafting, and triage.
        </h3>
        <p className="mt-3 text-sm leading-7 text-muted-strong">
          Use AI where it actually saves time.
        </p>
      </motion.div>

      <div className="relative mt-6 flex flex-wrap gap-3">
        <div className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-accent">
          Less manual work
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs uppercase tracking-[0.28em] text-white/75">
          Faster lead response
        </div>
      </div>
    </div>
  );
}
