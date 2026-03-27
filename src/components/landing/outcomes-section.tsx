import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function OutcomesSection() {
  return (
    <SectionShell>
      <SectionInner className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="max-w-xl">
          <SectionHeading
            eyebrow="Outcomes"
            title={siteContent.outcomes.title}
            description={siteContent.outcomes.description}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {siteContent.outcomes.items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <article className="surface-panel h-full rounded-[1.9rem] border border-white/10 p-6">
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
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
