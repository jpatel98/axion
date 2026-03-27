import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function ProcessSection() {
  return (
    <SectionShell id="process">
      <SectionInner>
        <SectionHeading
          eyebrow="Process"
          title={siteContent.process.title}
          description={siteContent.process.description}
          align="center"
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-4">
          {siteContent.process.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.05}>
              <article className="surface-panel relative h-full rounded-[2rem] border border-white/10 p-6">
                <div className="mb-8 flex items-center justify-between">
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-accent">
                    Step {index + 1}
                  </span>
                  <span className="text-5xl font-display italic text-white/12">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-strong">
                  {step.description}
                </p>
                <p className="mt-6 border-t border-white/8 pt-4 text-sm text-white">
                  {step.outcome}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
