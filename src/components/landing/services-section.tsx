import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function ServicesSection() {
  return (
    <SectionShell id="services">
      <SectionInner>
        <SectionHeading
          eyebrow="Services"
          title={siteContent.services.title}
          description={siteContent.services.description}
        />

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {siteContent.services.items.map((service, index) => (
            <Reveal key={service.title} delay={index * 0.04}>
              <article className="surface-panel flex h-full flex-col rounded-[2rem] border border-white/10 p-6 sm:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <p className="font-mono text-[0.72rem] uppercase tracking-[0.28em] text-accent">
                      0{index + 1}
                    </p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {service.title}
                    </h3>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                    {service.label}
                  </span>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-strong">
                  {service.description}
                </p>
                <div className="mt-6 border-t border-white/8 pt-5">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                    Business outcome
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white">
                    {service.outcome}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
