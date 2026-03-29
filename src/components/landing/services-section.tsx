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

        <Reveal delay={0.04}>
          <div className="mt-12 overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/[0.02] shadow-[0_30px_80px_rgba(2,7,17,0.34)]">
            <div className="grid gap-px bg-white/10 lg:grid-cols-2">
              {siteContent.services.items.map((service, index) => (
                <article
                  key={service.title}
                  className="flex h-full flex-col bg-[rgba(8,13,24,0.94)] p-6 sm:p-7"
                >
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
                  <p className="mt-4 max-w-xl text-sm leading-7 text-muted-strong">
                    {service.description}
                  </p>
                  <p className="mt-6 pt-4 text-sm leading-7 text-white/90">
                    <span className="font-medium text-white">Outcome:</span>{" "}
                    {service.outcome}
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
