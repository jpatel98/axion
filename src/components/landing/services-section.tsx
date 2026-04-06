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
          <div className="mt-12 grid gap-px bg-accent/10 border border-accent/15 lg:grid-cols-2">
            {siteContent.services.items.map((service, index) => (
              <article
                key={service.title}
                className="flex h-full flex-col bg-[#030508] p-5 sm:p-6"
              >
                <div>
                  <p className="text-xs text-accent">
                    [{String(index + 1).padStart(2, "0")}]
                  </p>
                  <h3 className="mt-3 text-base font-bold text-white sm:text-xl">
                    {service.title}
                  </h3>
                </div>
                <p className="mt-3 max-w-xl text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                  {service.description}
                </p>
                <p className="mt-4 border-t border-accent/8 pt-4 text-xs leading-6 text-white/90 sm:text-sm sm:leading-7">
                  <span className="text-accent">{"=> "}</span>
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
