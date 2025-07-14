/* ──────────────────────────────────────────────────────────────
   src/app/layout.tsx
   Root layout – server component
──────────────────────────────────────────────────────────────── */

import type { Metadata } from "next";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Geist, Geist_Mono } from "next/font/google";

/* ✅ direct import – Aurora is a client component */
import Aurora from "../components/AuroraGate";

import "./globals.css";
import AuroraGate from "../components/AuroraGate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mayocity",
  description: "Simple, direct job board",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Belleza for headings */}
        <link
          href="https://fonts.googleapis.com/css2?family=Belleza&display=swap"
          rel="stylesheet"
        />
      </head>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pageContainer`}
      >
        {/* ――― animated background ――― */}
        <AuroraGate
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={2}
          amplitude={2}
          speed={4}
        />

        {/* ――― site chrome ――― */}
        <Header />
        <main className="pageContent">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
