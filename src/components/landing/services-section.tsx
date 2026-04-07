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
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {siteContent.services.items.map((service, index) => (
              <article
                key={service.title}
                className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-strong p-6"
              >
                <p className="text-sm font-semibold text-accent">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-bold text-white">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-strong">
                  {service.description}
                </p>
                <p className="mt-4 border-t border-border-subtle pt-4 text-sm font-medium text-foreground">
                  {service.outcome}
                </p>
              </article>
            ))}
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
