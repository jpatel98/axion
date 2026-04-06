import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-6 sm:py-8">
      <SectionInner>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1.5 py-3 text-[0.55rem] uppercase tracking-[0.05em] sm:gap-x-2 sm:gap-y-2 sm:text-xs sm:tracking-[0.2em]">
            {siteContent.credibility.map((item, index) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 text-accent/60"
              >
                {index > 0 ? (
                  <span className="text-accent/20">|</span>
                ) : null}
                [{item.replace(/\s+/g, "_").toUpperCase()}]
              </span>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
