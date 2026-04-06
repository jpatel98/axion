import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function EarlyAccessSection() {
  return (
    <SectionShell id="early-access" className="bg-accent/[0.04]">
      <SectionInner>
        <SectionHeading
          eyebrow="Early Access"
          title={siteContent.earlyAccess.title}
          description={siteContent.earlyAccess.description}
          align="center"
        />

        <Reveal delay={0.06}>
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 sm:grid-cols-2">
            <div className="border border-accent/15 bg-[#030508] p-5 sm:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-accent">
                What it handles
              </h3>
              <ul className="mt-4 space-y-3">
                {siteContent.earlyAccess.handles.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7"
                  >
                    <span className="text-accent">*</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border border-accent/15 bg-[#030508] p-5 sm:p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-green-400">
                What that means
              </h3>
              <ul className="mt-4 space-y-3">
                {siteContent.earlyAccess.means.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-xs leading-6 text-muted-strong sm:text-sm sm:leading-7"
                  >
                    <span className="text-green-400">*</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="mt-10 text-center">
            <a
              href={siteContent.earlyAccess.ctaHref}
              className="inline-flex items-center justify-center gap-2 border border-accent/40 bg-accent/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-accent hover:bg-accent/20 hover:shadow-[0_0_20px_rgba(125,211,252,0.15)] sm:text-sm"
            >
              [ {siteContent.earlyAccess.ctaLabel} ]
            </a>
            <p className="mt-4 text-xs text-muted sm:text-sm">
              {siteContent.earlyAccess.footnote}
            </p>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
