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
  title:
    "Axion Technologies | Software Factory Powered by AI Agents for Small Business",
  description:
    "Axion is a software factory powered by autonomous AI agents. We build websites, automate workflows, and deploy intelligent systems for small businesses \u2014 faster and cheaper than any agency.",
  keywords: [
    "AI software factory",
    "autonomous AI agents for small business",
    "AI-powered website builder",
    "small business automation",
    "AI agents for clinics",
    "business process automation AI",
    "small business software development",
    "AI workflow automation",
  ],
} as const;
