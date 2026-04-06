import type { ReactNode } from "react";
import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { ButtonLink } from "@/components/landing/link-button";
import { Reveal } from "@/components/landing/reveal";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

type CtaSectionProps = {
  children: ReactNode;
};

export function CtaSection({ children }: CtaSectionProps) {
  return (
    <SectionShell id="contact" className="pb-24 pt-20 sm:pt-24">
      <SectionInner>
        <div className="relative border border-accent/15 bg-[#030508] p-4 sm:p-6 md:p-8 lg:p-12">
          <div className="relative grid gap-10 lg:grid-cols-[0.98fr_1.02fr]">
            <Reveal>
              <div className="max-w-xl">
                <p className="text-xs uppercase tracking-[0.2em]">
                  <span aria-hidden="true" className="text-accent">
                    ${" "}
                  </span>
                  <span className="text-muted-strong">axion</span>
                  <span className="text-muted"> --</span>
                  <span className="text-accent">{siteContent.contact.eyebrow.toLowerCase().replace(/\u2019/g, "")}</span>
                </p>
                <h2 className="glow-text mt-4 text-2xl font-bold leading-tight text-white sm:text-3xl lg:text-4xl">
                  {siteContent.contact.title}
                </h2>
                <p className="mt-4 max-w-lg text-xs leading-6 text-muted-strong sm:text-base sm:leading-8">
                  {siteContent.contact.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href={siteConfig.bookingUrl} bookingSource="final">
                    {"[ "}{siteContent.contact.primaryCta}{" ]"}
                  </ButtonLink>
                  <ButtonLink
                    href={`mailto:${siteConfig.contactEmail}`}
                    variant="secondary"
                  >
                    {"[ "}Email us{" ]"}
                  </ButtonLink>
                </div>

                <p className="mt-4 text-sm leading-7 text-muted">
                  <span aria-hidden="true" className="text-accent/50">
                    {">"}{" "}
                  </span>
                  {siteContent.contact.primaryNote}
                </p>

                <div className="mt-8 space-y-2">
                  {siteContent.contact.reassurance.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <span className="text-green-400">*</span>
                      <p className="text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7">
                        {item}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>{children}</Reveal>
          </div>
        </div>
      </SectionInner>
    </SectionShell>
  );
}
