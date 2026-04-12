import { ContactForm } from "@/components/contact-form";
import { CtaSection } from "@/components/landing/cta-section";
import { CredibilityStrip } from "@/components/landing/credibility-strip";
import { EarlyAccessSection } from "@/components/landing/early-access-section";
import { FaqSection } from "@/components/landing/faq-section";
import { HeroSection } from "@/components/landing/hero-section";
import { PricingSection } from "@/components/landing/pricing-section";
import { ProcessSection } from "@/components/landing/process-section";
import { ProofSection } from "@/components/landing/proof-section";
import { ServicesSection } from "@/components/landing/services-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { WhyAxionSection } from "@/components/landing/why-axion-section";

export default function Home() {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <SiteHeader />
      <main id="main-content" className="relative overflow-x-clip">
        <HeroSection />
        <CredibilityStrip />
        <ProofSection />
        <ServicesSection />
        <PricingSection />
        <WhyAxionSection />
        <ProcessSection />
        <FaqSection />
        <EarlyAccessSection />
        <CtaSection>
          <ContactForm />
        </CtaSection>
      </main>
      <SiteFooter />
    </>
  );
}
