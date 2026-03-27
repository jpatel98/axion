export const siteConfig = {
  name: "Axion Technologies",
  domain: "axiontechnologies.ca",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://axiontechnologies.ca",
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? "#contact",
  contactEmail:
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "hello@axiontechnologies.ca",
  title:
    "Axion Technologies | Modern Websites, Automation, and Practical AI for Small Business",
  description:
    "Axion Technologies helps small and growing businesses get online properly, modernize operations, automate repetitive work, and use AI in practical ways.",
  keywords: [
    "small business website design",
    "AI automation for small business",
    "digital transformation for small business",
    "business process automation",
    "modern websites for local businesses",
    "small business automation consulting",
  ],
} as const;
