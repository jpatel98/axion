"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { siteContent } from "@/content/site";
import { trackBookingClick } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileCtaVisible, setIsMobileCtaVisible] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { theme, toggleTheme } = useTheme();

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
            ? "border-border-subtle bg-background/90 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-background/60 backdrop-blur-md",
        )}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <a href="#top" className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl italic text-foreground">
              Axion
            </span>
          </a>

          <nav className="hidden items-center gap-1 md:flex">
            {siteContent.nav.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-md px-3 py-1.5 text-sm text-muted-strong hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border-subtle text-muted-strong hover:text-foreground"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
            <a
              href={siteConfig.bookingUrl}
              onClick={() => trackBookingClick("header")}
              className="inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background hover:opacity-90"
            >
              {siteContent.headerCta}
            </a>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex size-9 items-center justify-center rounded-full border border-border-subtle text-muted-strong"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border-subtle text-muted-strong"
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((current) => !current)}
            >
              {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isMenuOpen ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: -8 }}
            animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="border-b border-border-subtle bg-background/95 px-4 backdrop-blur-xl md:hidden"
          >
            <nav className="mx-auto flex max-w-7xl flex-col py-2">
              {siteContent.nav.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="border-b border-border-subtle/50 px-2 py-3 text-sm text-muted-strong hover:text-foreground"
                  onClick={() => setIsMenuOpen(false)}
                >
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
                className="inline-flex w-full items-center justify-center rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
              >
                {siteContent.headerCta}
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
              className="mx-auto flex max-w-md items-center justify-center rounded-full bg-foreground px-5 py-3.5 text-sm font-medium text-background shadow-lg"
            >
              {siteContent.mobileStickyCta}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
