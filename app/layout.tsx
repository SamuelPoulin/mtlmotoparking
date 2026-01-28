import type { Metadata } from "next";

import StyledComponentsRegistry from "@/src/lib/registry";
import { Footer } from "@/src/components/Footer";
import { Header } from "@/src/components/Header";

import "./globals.css";

export const metadata: Metadata = {
  title: "mtlmotoparking - Montreal Motorcycle Parkings",
  description: "Find and navigate to motorcycle parking spots in Montreal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased">
        <StyledComponentsRegistry>
          <Header />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
