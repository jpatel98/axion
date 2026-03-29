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
      <SectionInner className="max-w-5xl">
        <SectionHeading
          eyebrow="FAQ"
          title={siteContent.faq.title}
          description={siteContent.faq.description}
          align="center"
        />

        <Reveal delay={0.04}>
          <div className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.3)]">
            {siteContent.faq.items.map((item, index) => {
              const isOpen = index === openIndex;

              return (
                <div
                  key={item.question}
                  className={cn(index > 0 && "border-t border-white/10")}
                >
                  <button
                    type="button"
                    className="flex w-full items-center justify-between gap-6 px-5 py-5 text-left sm:px-6"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    onClick={() =>
                      setOpenIndex((current) => (current === index ? -1 : index))
                    }
                  >
                    <span className="text-lg font-semibold text-white">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-5 shrink-0 text-muted transition-transform",
                        isOpen && "rotate-180 text-accent",
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
                      <p className="border-t border-white/8 px-5 py-5 text-sm leading-7 text-muted-strong sm:px-6">
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
