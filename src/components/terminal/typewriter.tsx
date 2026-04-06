"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type TypeWriterProps = {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
};

export function TypeWriter({
  text,
  speed = 35,
  delay = 0,
  className,
  onComplete,
}: TypeWriterProps) {
  const prefersReducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState(() =>
    prefersReducedMotion ? text : "",
  );
  const [started, setStarted] = useState(false);
  const completeCalled = useRef(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      if (!completeCalled.current) {
        completeCalled.current = true;
        onComplete?.();
      }
      return;
    }

    const delayTimer = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(delayTimer);
  }, [delay, prefersReducedMotion, onComplete]);

  useEffect(() => {
    if (!started || prefersReducedMotion) return;

    if (displayed.length >= text.length) {
      if (!completeCalled.current) {
        completeCalled.current = true;
        onComplete?.();
      }
      return;
    }

    const timer = setTimeout(() => {
      setDisplayed(text.slice(0, displayed.length + 1));
    }, speed);

    return () => clearTimeout(timer);
  }, [started, displayed, text, speed, prefersReducedMotion, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!prefersReducedMotion && displayed.length < text.length && (
        <span className="inline-block animate-pulse text-accent">_</span>
      )}
    </span>
  );
}
