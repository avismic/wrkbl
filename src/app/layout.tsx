// src/app/layout.tsx
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Load Belleza from Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Belleza&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased pageContainer`}
      >
        <Header />
        <main className="pageContent">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
