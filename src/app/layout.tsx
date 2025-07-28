import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import { ToastManagerProvider } from '@/lib/toast'
import "./globals.css";

export const metadata: Metadata = {
  title: "Axion - Manufacturing ERP",
  description: "The single source of truth for manufacturing businesses",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <ToastManagerProvider>
            {children}
          </ToastManagerProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}