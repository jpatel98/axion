import { siteContent } from "@/content/site";
import { CountUp } from "@/components/landing/count-up";
import { Reveal } from "@/components/landing/reveal";
import { SectionHeading } from "@/components/landing/section-heading";
import { SectionInner, SectionShell } from "@/components/landing/section-shell";

const proofStats = [
  { to: 3, suffix: "x", label: "inquiry quality" },
  { to: 40, suffix: "%", label: "less front-desk time" },
  { to: 6, prefix: "~", suffix: "h/wk", label: "admin work eliminated" },
];

export function ProofSection() {
  return (
    <SectionShell id="results">
      <SectionInner>
        <SectionHeading
          eyebrow="Results"
          title={siteContent.proof.title}
          description={siteContent.proof.description}
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {proofStats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.06}>
              <div className="rounded-2xl border border-border-subtle bg-surface-strong px-5 py-7 text-center">
                <div className="text-4xl font-extrabold tracking-tight text-accent sm:text-5xl">
                  <CountUp
                    to={stat.to}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-strong">{stat.label}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {siteContent.proof.scenarios.map((item, index) => (
            <Reveal key={item.industry} delay={index * 0.06}>
              <article className="flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-strong p-6 sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-accent">
                  {item.industry}
                </p>
                <h3 className="mt-3 text-base font-bold text-white sm:text-lg">
                  {item.problem}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-muted-strong">
                  {item.fix}
                </p>
                <ul className="mt-5 space-y-2 border-t border-border-subtle pt-5">
                  {item.outcomes.map((outcome) => (
                    <li key={outcome} className="flex items-start gap-2 text-sm leading-6 text-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </SectionInner>
    </SectionShell>
  );
}
