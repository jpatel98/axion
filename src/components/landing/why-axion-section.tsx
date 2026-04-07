import { siteContent } from "@/content/site";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

export function WhyAxionSection() {
  return (
    <SectionShell id="why-axion">
      <SectionInner className="grid gap-12 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Why Axion"
            title={siteContent.whyAxion.title}
            description={siteContent.whyAxion.description}
          />

          <div className="mt-8 space-y-6">
            {siteContent.whyAxion.principles.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.04}>
                <article className="border-b border-border-subtle pb-6 last:border-b-0 last:pb-0">
                  <p className="font-mono text-xs text-muted">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-muted-strong">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.06}>
          <div className="overflow-hidden rounded-xl border border-border-subtle">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border-subtle bg-surface-strong">
                  <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted">Option</th>
                  <th className="px-5 py-3 text-left font-mono text-xs uppercase tracking-wider text-muted">What happens</th>
                </tr>
              </thead>
              <tbody>
                {siteContent.whyAxion.comparisons.map((item) => (
                  <tr key={item.label} className="border-b border-border-subtle last:border-b-0">
                    <td className="px-5 py-4 align-top font-medium text-foreground">
                      {item.label}
                    </td>
                    <td className="px-5 py-4 align-top">
                      <p className="font-medium text-foreground">{item.title}</p>
                      <p className="mt-1 text-muted-strong">{item.description}</p>
                    </td>
                  </tr>
                ))}
                <tr className="bg-surface-dark text-surface-dark-foreground">
                  <td className="px-5 py-4 align-top font-medium">
                    Axion
                  </td>
                  <td className="px-5 py-4 align-top">
                    <p className="font-medium">Practical change. Working software. Fewer problems.</p>
                    <p className="mt-1 opacity-70">Agents build. Humans guide. You own everything.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Reveal>
      </SectionInner>
    </SectionShell>
  );
}
