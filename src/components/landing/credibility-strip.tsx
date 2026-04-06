import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-6 sm:py-8">
      <SectionInner>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 py-3 text-[0.65rem] uppercase tracking-[0.2em] sm:text-xs">
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
