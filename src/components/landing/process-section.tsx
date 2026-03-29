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

        <Reveal delay={0.04}>
          <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
            <div className="grid gap-px bg-white/10 lg:grid-cols-4">
              {siteContent.process.steps.map((step, index) => (
                <article
                  key={step.title}
                  className="h-full bg-[rgba(8,13,24,0.94)] p-6 sm:p-7"
                >
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-accent">
                    Step 0{index + 1}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-muted-strong">
                    {step.description}
                  </p>
                  <p className="mt-6 text-sm leading-7 text-white/90">
                    <span className="font-medium text-white">Outcome:</span>{" "}
                    {step.outcome}
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
