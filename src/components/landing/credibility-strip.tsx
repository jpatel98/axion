import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function CredibilityStrip() {
  return (
    <SectionShell className="py-8 sm:py-10">
      <SectionInner>
        <Reveal>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 py-4">
            {siteContent.credibility.map((item, index) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-white/40"
              >
                {index > 0 ? (
                  <span className="text-white/15">/</span>
                ) : null}
                <span className="size-1.5 rounded-full bg-accent/70" />
                {item}
              </span>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
