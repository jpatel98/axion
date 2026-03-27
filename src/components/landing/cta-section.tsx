import { ArrowUpRight, CheckCircle2 } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(140deg,rgba(125,211,252,0.12),rgba(8,12,18,0)_32%),linear-gradient(180deg,#0a1120,#09101b)] px-6 py-8 shadow-[0_40px_120px_rgba(1,6,16,0.58)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.22),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(67,110,201,0.26),transparent_28%)]" />
          <div className="relative grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
            <Reveal>
              <div className="max-w-xl">
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-accent">
                  {siteContent.contact.eyebrow}
                </p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  {siteContent.contact.title}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-8 text-muted-strong sm:text-lg">
                  {siteContent.contact.description}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <ButtonLink href={siteConfig.bookingUrl}>
                    {siteContent.contact.primaryCta}
                    <ArrowUpRight className="size-4" />
                  </ButtonLink>
                  <ButtonLink href={`mailto:${siteConfig.contactEmail}`} variant="secondary">
                    Email us
                  </ButtonLink>
                </div>

                <div className="mt-10 space-y-4">
                  {siteContent.contact.reassurance.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-4"
                    >
                      <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                      <p className="text-sm leading-7 text-muted-strong">{item}</p>
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
