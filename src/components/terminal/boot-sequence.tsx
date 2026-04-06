"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const bootLines = [
  { text: "AXION SYSTEMS v2.0", delay: 0 },
  { text: "Initializing modules...", delay: 300 },
  { text: "[OK] web_presence", delay: 700, color: "text-green-400" },
  { text: "[OK] automation_engine", delay: 1000, color: "text-green-400" },
  { text: "[OK] ai_layer", delay: 1300, color: "text-green-400" },
  { text: "", delay: 1500 },
  { text: "System ready.", delay: 1700, color: "text-accent" },
];

function getHasPlayed() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem("axion-boot-done") === "1";
}

const subscribe = () => () => {};

export function BootSequence() {
  const prefersReducedMotion = useReducedMotion();
  const hasPlayed = useSyncExternalStore(subscribe, getHasPlayed, () => false);
  const shouldSkip = hasPlayed || Boolean(prefersReducedMotion);
  const [visible, setVisible] = useState(!shouldSkip);
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (shouldSkip) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    bootLines.forEach((line, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleLines(i + 1);
        }, line.delay),
      );
    });

    timers.push(
      setTimeout(() => {
        setVisible(false);
        sessionStorage.setItem("axion-boot-done", "1");
      }, 2400),
    );

    return () => timers.forEach(clearTimeout);
  }, [shouldSkip]);

  if (shouldSkip) return null;

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-[#030508]"
        >
          <div className="w-full max-w-md px-6 text-sm">
            {bootLines.slice(0, visibleLines).map((line, i) => (
              <p key={i} className={line.color ?? "text-muted-strong"}>
                {line.text || "\u00A0"}
              </p>
            ))}
            {visibleLines < bootLines.length && (
              <span className="cursor-blink" />
            )}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
