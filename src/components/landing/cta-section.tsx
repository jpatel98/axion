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
        <div className="relative rounded-2xl border border-border-subtle bg-surface p-6 sm:p-8 md:p-10 lg:p-14">
          <div className="relative grid gap-10 lg:grid-cols-[0.98fr_1.02fr]">
            <Reveal>
              <div className="max-w-xl">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                  {siteContent.contact.eyebrow}
                </p>
                <h2 className="mt-4 font-display text-3xl italic leading-tight tracking-tight text-foreground sm:text-4xl">
                  {siteContent.contact.title}
                </h2>
                <p className="mt-4 max-w-lg text-base leading-7 text-muted-strong sm:text-lg sm:leading-8">
                  {siteContent.contact.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <ButtonLink href={siteConfig.bookingUrl} bookingSource="final">
                    {siteContent.contact.primaryCta}
                  </ButtonLink>
                  <ButtonLink
                    href={`mailto:${siteConfig.contactEmail}`}
                    variant="secondary"
                  >
                    Email us
                  </ButtonLink>
                </div>

                <p className="mt-4 font-mono text-xs text-muted sm:text-sm">
                  {siteContent.contact.primaryNote}
                </p>

                <div className="mt-8 space-y-3">
                  {siteContent.contact.reassurance.map((item) => (
                    <div key={item} className="flex items-start gap-2.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground opacity-30" />
                      <p className="text-sm leading-7 text-muted-strong">
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
