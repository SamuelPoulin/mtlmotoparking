import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";

import StyledComponentsRegistry from "@/src/lib/registry";
import { Footer } from "@/src/components/Footer";
import { Header } from "@/src/components/Header";

import "../globals.css";
import { QueryProvider } from "@/src/lib/api/QueryProvider";
import { ThemeProvider } from "@/src/components/ThemeProvider";

export const metadata: Metadata = {
  title: "mtlmotoparking",
  description: "Find and navigate to motorcycle parking spots in Montreal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="h-full flex flex-col font-sans antialiased">
        <StyledComponentsRegistry>
          <NextIntlClientProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <Header />
                <main className="flex flex-1">{children}</main>
                <Footer />
              </ThemeProvider>
            </QueryProvider>
          </NextIntlClientProvider>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
