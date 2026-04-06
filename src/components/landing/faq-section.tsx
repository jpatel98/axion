"use client";

import { useState } from "react";
import { siteContent } from "@/content/site";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { TerminalWindow } from "@/components/terminal/terminal-window";

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <SectionShell id="faq">
      <SectionInner className="max-w-5xl">
        <SectionHeading
          eyebrow="FAQ"
          title={siteContent.faq.title}
          description={siteContent.faq.description}
          align="center"
        />

        <Reveal delay={0.04}>
          <TerminalWindow title="axion :: help" className="mt-10">
            {siteContent.faq.items.map((item, index) => {
              const isOpen = index === openIndex;

              return (
                <div
                  key={item.question}
                  className={cn(index > 0 && "border-t border-accent/10")}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-4 py-4 text-left"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? -1 : index))
                    }
                  >
                    <span className="text-xs text-white sm:text-base">
                      <span aria-hidden="true" className="text-accent">
                        ${" "}
                      </span>
                      <span className="hidden sm:inline">help &quot;{item.question}&quot;</span>
                      <span className="sm:hidden">{item.question}</span>
                    </span>
                    <span className="shrink-0 text-xs text-accent">
                      {isOpen ? "[-]" : "[+]"}
                    </span>
                  </button>
                  <div
                    id={`faq-panel-${index}`}
                    className={cn(
                      "grid transition-[grid-template-rows] duration-300 ease-out",
                      isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="border-t border-accent/8 py-4 text-sm leading-7 text-muted-strong">
                        <span
                          aria-hidden="true"
                          className="text-accent/50"
                        >
                          {">"}{" "}
                        </span>
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </TerminalWindow>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
