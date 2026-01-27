import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "mtlmotoparkings - Montreal Motorcycle Parkings",
  description: "Find and navigate to motorcycle parking spots in Montreal.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
