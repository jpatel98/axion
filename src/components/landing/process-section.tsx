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

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {siteContent.process.steps.map((step, index) => (
            <Reveal key={step.title} delay={index * 0.06}>
              <article className="h-full rounded-2xl border border-border-subtle bg-surface-strong p-6">
                <p className="text-sm font-bold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-muted-strong">
                  {step.description}
                </p>
                <p className="mt-4 border-t border-border-subtle pt-4 text-sm font-medium text-foreground">
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
