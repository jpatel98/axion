"use client";

import { motion, useReducedMotion } from "framer-motion";
import { TerminalWindow } from "@/components/terminal/terminal-window";

const statusRows = [
  { module: "intake", status: "READY", latency: "2m" },
  { module: "workflow_map", status: "READY", latency: "48h" },
  { module: "quick_wins", status: "READY", latency: "ranked" },
];

const statsRows = [
  { label: "GOAL", value: "save_time" },
  { label: "GOAL", value: "grow_revenue" },
  { label: "GOAL", value: "new_capability" },
];

export function SystemsVisual() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <TerminalWindow
      title="axion :: status"
      className="mx-auto w-full max-w-[34rem]"
    >
      <div className="overflow-x-auto text-[0.65rem] sm:text-sm">
        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="text-muted-strong"
        >
          <span className="text-accent">$</span> axion assess --quick-wins
        </motion.p>

        <div className="mt-4">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="grid grid-cols-3 gap-x-2 text-muted sm:gap-x-4"
          >
            <span>STEP</span>
            <span>STATUS</span>
            <span>OUTPUT</span>
          </motion.div>
          <motion.p
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="overflow-hidden text-accent/30"
          >
            ─────────────────────────────────────
          </motion.p>

          {statusRows.map((row, i) => (
            <motion.div
              key={row.module}
              initial={prefersReducedMotion ? undefined : { opacity: 0, x: -8 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.5 + i * 0.15 }}
              className="grid grid-cols-3 gap-x-2 leading-7 sm:gap-x-4"
            >
              <span className="text-muted-strong">{row.module}</span>
              <span className="text-green-400">[{row.status}]</span>
              <span className="text-muted">{row.latency}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-5 border-t border-accent/10 pt-4">
          {statsRows.map((stat, i) => (
            <motion.p
              key={stat.value}
              initial={prefersReducedMotion ? undefined : { opacity: 0 }}
              whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.95 + i * 0.12 }}
              className="leading-7"
            >
              <span className="text-muted">{stat.label}:</span>{" "}
              <span className="text-accent">{stat.value}</span>
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          whileInView={prefersReducedMotion ? undefined : { opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 1.35 }}
          className="mt-4 text-green-400"
        >
          Assessment funnel ready. <span className="cursor-blink" />
        </motion.p>
      </div>
    </TerminalWindow>
  );
}
