import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";
import { TerminalWindow } from "@/components/terminal/terminal-window";

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
          <TerminalWindow title="axion :: services" className="mt-12">
            <div className="grid gap-px bg-accent/10 lg:grid-cols-2">
              {siteContent.services.items.map((service, index) => (
                <article
                  key={service.title}
                  className="flex h-full flex-col bg-[#030508] p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-xs text-accent">
                        [{String(index + 1).padStart(2, "0")}]
                      </p>
                      <h3 className="mt-3 text-base font-bold text-white sm:text-xl">
                        {service.title}
                      </h3>
                    </div>
                    <span className="shrink-0 border border-accent/20 px-2 py-1 text-[0.6rem] uppercase tracking-wider text-accent/70 sm:text-[0.65rem]">
                      &lt;{service.label.toLowerCase()}&gt;
                    </span>
                  </div>
                  <p className="mt-3 max-w-xl text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                    {service.description}
                  </p>
                  <p className="mt-4 border-t border-accent/8 pt-4 text-xs leading-6 text-white/90 sm:text-sm sm:leading-7">
                    <span className="text-accent">{`=> `}</span>
                    {service.outcome}
                  </p>
                </article>
              ))}
            </div>
          </TerminalWindow>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
