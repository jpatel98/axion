"use client";

import { useEffect, useRef, useState } from "react";
import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { cn } from "@/lib/utils";

export function ProcessSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setDrawn(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <SectionShell id="process">
      <SectionInner>
        <SectionHeading
          eyebrow="Process"
          title={siteContent.process.title}
          description={siteContent.process.description}
          align="center"
        />

        <div ref={containerRef} className="relative mt-12">
          <div
            aria-hidden="true"
            className={cn(
              "process-connector hidden lg:block",
              drawn && "drawn",
            )}
          />
          <div className="relative z-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {siteContent.process.steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 0.12}>
                <article className="relative h-full rounded-2xl border border-border-subtle bg-surface-strong p-6">
                  <div
                    className="flex size-9 items-center justify-center rounded-full border border-accent bg-surface-strong text-sm font-bold text-accent"
                    style={{ boxShadow: "0 0 0 4px var(--background)" }}
                  >
                    {index + 1}
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-strong">
                    {step.description}
                  </p>
                  <p className="mt-4 border-t border-border-subtle pt-4 text-sm font-medium text-foreground">
                    {step.outcome}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
