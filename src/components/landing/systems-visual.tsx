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
            System overview
          </p>
          <p className="mt-3 text-sm leading-7 text-muted-strong">
            One stack. First click to follow-up.
          </p>
        </div>
        <div className="rounded-full border border-accent/25 bg-accent/[0.06] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent/80">
          status: operational
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
        <h3 className="mt-4 text-xl font-semibold text-white">
          Site &middot; Search &middot; Lead capture
        </h3>
        <div className="mt-4 flex flex-wrap gap-2 font-mono text-xs text-muted-strong">
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            &lt;1s load
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            SEO-ready
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5">
            auto-capture
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
          Booking &rarr; Intake &rarr; Reminders
        </h3>
        <p className="mt-3 font-mono text-xs leading-6 text-muted-strong">
          Zero duplicate entry. Zero dropped steps.
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
          Triage &middot; Draft &middot; Respond
        </h3>
        <p className="mt-3 font-mono text-xs leading-6 text-muted-strong">
          AI where it saves time. Nowhere else.
        </p>
      </motion.div>

      <div className="relative mt-6 flex flex-wrap gap-3">
        <div className="rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-accent">
          &minus;80% manual work
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-white/60">
          response_time: &lt;1h
        </div>
      </div>
    </div>
  );
}
