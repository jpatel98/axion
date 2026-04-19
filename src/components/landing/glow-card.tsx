"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type GlowCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function GlowCard({ children, className, style }: GlowCardProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty(
      "--glow-x",
      `${((event.clientX - rect.left) / rect.width) * 100}%`,
    );
    el.style.setProperty(
      "--glow-y",
      `${((event.clientY - rect.top) / rect.height) * 100}%`,
    );
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      className={cn("glow-card", className)}
      style={style}
    >
      {children}
    </div>
  );
}
