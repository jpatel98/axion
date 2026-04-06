import { ContactForm } from "@/components/contact-form";
import { CtaSection } from "@/components/landing/cta-section";
import { CredibilityStrip } from "@/components/landing/credibility-strip";
import { FaqSection } from "@/components/landing/faq-section";
import { HeroSection } from "@/components/landing/hero-section";
import { ProcessSection } from "@/components/landing/process-section";
import { ProofSection } from "@/components/landing/proof-section";
import { ServicesSection } from "@/components/landing/services-section";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { WhyAxionSection } from "@/components/landing/why-axion-section";
import { BootSequence } from "@/components/terminal/boot-sequence";

export default function Home() {
  return (
    <>
      <BootSequence />
      <SiteHeader />
      <main id="top" className="relative overflow-x-clip">
        <HeroSection />
        <CredibilityStrip />
        <ProofSection />
        <ServicesSection />
        <WhyAxionSection />
        <ProcessSection />
        <FaqSection />
        <CtaSection>
          <ContactForm />
        </CtaSection>
      </main>
      <SiteFooter />
    </>
  );
}
