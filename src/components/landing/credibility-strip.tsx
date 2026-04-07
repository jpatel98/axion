import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-6 sm:py-10">
      <SectionInner>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-y border-border-subtle py-6">
            {siteContent.credibility.map((item, index) => (
              <span
                key={item}
                className="flex items-center gap-x-8 font-mono text-xs uppercase tracking-[0.15em] text-muted sm:text-sm"
              >
                {index > 0 && (
                  <span className="hidden text-border-strong sm:inline" aria-hidden="true">/</span>
                )}
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
