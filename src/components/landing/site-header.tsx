"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteContent } from "@/content/site";
import { trackBookingClick } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCtaVisible, setIsMobileCtaVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleScroll() {
      setHasScrolled(window.scrollY > 16);

      const hero = document.getElementById("hero");
      const contact = document.getElementById("contact");

      if (!hero || !contact) {
        setIsMobileCtaVisible(false);
        return;
      }

      const heroBottom = hero.getBoundingClientRect().bottom;
      const contactTop = contact.getBoundingClientRect().top;
      setIsMobileCtaVisible(
        heroBottom < 160 && contactTop > window.innerHeight * 0.8,
      );
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cn(
          "border-b px-4 py-3 transition-all sm:px-6 lg:px-8",
          hasScrolled
            ? "border-accent/15 bg-[#030508]/95 shadow-[0_18px_56px_rgba(0,0,0,0.5)] backdrop-blur-xl"
            : "border-accent/8 bg-[#030508]/80 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#top" className="flex items-baseline gap-1">
            <span className="text-base font-bold text-accent">
              AXION
            </span>
            <span className="cursor-blink text-accent" />
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {siteContent.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="px-3 py-1.5 text-xs uppercase tracking-wider text-muted-strong hover:text-accent"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:block">
            <a
              href={siteConfig.bookingUrl}
              onClick={() => trackBookingClick("header")}
              className="inline-flex items-center border border-accent/30 bg-accent/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent hover:bg-accent/15"
            >
              [ {siteContent.headerCta} ]
            </a>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center border border-accent/20 bg-accent/[0.03] text-accent md:hidden"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-b border-accent/10 bg-[#030508]/95 px-4 backdrop-blur-xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col py-2">
              {siteContent.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="border-b border-accent/5 px-2 py-3 text-xs uppercase tracking-wider text-muted-strong hover:text-accent"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span aria-hidden="true" className="text-accent/50">
                    {">"}{" "}
                  </span>
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mx-auto max-w-7xl pb-4">
              <a
                href={siteConfig.bookingUrl}
                onClick={() => {
                  trackBookingClick("header");
                  setIsMenuOpen(false);
                }}
                className="inline-flex w-full items-center justify-center border border-accent/30 bg-accent/[0.06] px-4 py-3 text-xs font-bold uppercase tracking-wider text-accent"
              >
                [ {siteContent.headerCta} ]
              </a>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileCtaVisible ? (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? undefined : { opacity: 0, y: 18 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden"
          >
            <a
              href={siteConfig.bookingUrl}
              onClick={() => trackBookingClick("mobile_sticky")}
              className="mx-auto flex max-w-md items-center justify-center border border-accent/25 bg-[#030508]/95 px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-accent shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl"
            >
              [ {siteContent.mobileStickyCta} ]
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
