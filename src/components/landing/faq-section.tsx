"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { siteContent } from "@/content/site";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <SectionShell id="faq">
      <SectionInner className="max-w-4xl">
        <SectionHeading
          eyebrow="FAQ"
          title={siteContent.faq.title}
          description={siteContent.faq.description}
          align="center"
        />

        <Reveal delay={0.04}>
          <div className="mt-10 divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
            {siteContent.faq.items.map((item, index) => {
              const isOpen = index === openIndex;

              return (
                <div key={item.question}>
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? -1 : index))
                    }
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="shrink-0 font-mono text-xs text-muted">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium text-foreground sm:text-base">
                        {item.question}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 pl-[3.75rem] text-sm leading-7 text-muted-strong">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
