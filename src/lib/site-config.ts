export const siteConfig = {
  name: "Axion Technologies",
  domain: "axiontechnologies.ca",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://axiontechnologies.ca",
  bookingUrl:
    process.env.NEXT_PUBLIC_BOOKING_URL ??
    "https://calendly.com/jigarpatel2/call-with-axion-technologies",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@axiontechnologies.ca",
  gaMeasurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "",
  title: "Axion Technologies | Free AI Assessments for Growing Businesses",
  description:
    "Axion Technologies helps growing businesses find quick wins that save time, increase revenue, and unlock new capabilities through free AI assessments.",
  keywords: [
    "free AI assessment",
    "AI assessment for small business",
    "business automation assessment",
    "business process automation",
    "workflow automation for small business",
    "AI workflow automation",
    "small business software consulting",
    "digital systems for small business",
    "operations automation consulting",
  ],
} as const;
