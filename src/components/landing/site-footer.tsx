import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { SectionInner } from "@/components/landing/section-shell";

export function SiteFooter() {
  return (
    <footer className="border-t border-accent/15 py-10">
      <SectionInner>
        <p
          aria-hidden="true"
          className="mb-6 text-xs text-accent/15"
        >
          ════════════════════════════════════════
        </p>
      </SectionInner>

      <SectionInner className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-sm font-bold text-accent">
            AXION<span className="cursor-blink" />
          </p>
          <p className="mt-3 max-w-md text-sm leading-7 text-muted-strong">
            {siteContent.footer.tagline}
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              contact
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="block hover:text-accent"
              >
                <span aria-hidden="true" className="text-accent/40">
                  {">"}{" "}
                </span>
                {siteConfig.contactEmail}
              </a>
              <a
                href={siteConfig.siteUrl}
                className="block hover:text-accent"
              >
                <span aria-hidden="true" className="text-accent/40">
                  {">"}{" "}
                </span>
                {siteContent.footer.domain}
              </a>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider text-muted">
              navigate
            </p>
            <div className="mt-3 space-y-2 text-sm text-muted-strong">
              {siteContent.nav.map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-accent">
                  <span aria-hidden="true" className="text-accent/40">
                    {">"}{" "}
                  </span>
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </SectionInner>

      <SectionInner className="mt-8 flex flex-col gap-2 border-t border-accent/8 pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>axion@2026 $ {siteContent.footer.copyright}</p>
        <p>{siteContent.footer.legal}</p>
      </SectionInner>
    </footer>
  );
}
