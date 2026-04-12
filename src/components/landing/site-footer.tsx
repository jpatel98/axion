import Image from "next/image";
import { siteContent } from "@/content/site";
import { siteConfig } from "@/lib/site-config";
import { SectionInner } from "@/components/landing/section-shell";

export function SiteFooter() {
  return (
    <footer className="border-t border-border-subtle py-12">
      <SectionInner className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Image
            src="/axion-logo-stacked.png"
            alt={`${siteContent.footer.name} logo`}
            width={300}
            height={276}
            className="h-auto w-full max-w-[16rem] object-contain"
          />
          <p className="mt-4 max-w-md text-sm leading-7 text-muted-strong">
            {siteContent.footer.tagline}
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Contact
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-strong">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="block break-all hover:text-accent"
              >
                {siteConfig.contactEmail}
              </a>
              <a href={siteConfig.siteUrl} className="block hover:text-accent">
                {siteContent.footer.domain}
              </a>
            </div>
          </div>

          <nav aria-label="Footer">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Navigate
            </p>
            <div className="mt-4 space-y-2 text-sm text-muted-strong">
              {siteContent.nav.map((item) => (
                <a key={item.label} href={item.href} className="block hover:text-accent">
                  {item.label}
                </a>
              ))}
            </div>
          </nav>
        </div>
      </SectionInner>

      <SectionInner className="mt-10 flex flex-col gap-2 border-t border-border-subtle pt-8 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:text-sm">
        <p>{siteContent.footer.copyright}</p>
        <p>{siteContent.footer.legal}</p>
      </SectionInner>
    </footer>
  );
}
