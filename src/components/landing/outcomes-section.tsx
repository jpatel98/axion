import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function OutcomesSection() {
  return (
    <SectionShell id="results">
      <SectionInner className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-xl">
          <SectionHeading
            eyebrow="Outcomes"
            title={siteContent.outcomes.title}
            description={siteContent.outcomes.description}
          />
        </div>

        <Reveal delay={0.04}>
          <div className="overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.3)]">
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              {siteContent.outcomes.items.map((item) => (
                <article
                  key={item.title}
                  className="bg-[rgba(8,13,24,0.94)] p-6 sm:p-7"
                >
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                    {item.strapline}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
