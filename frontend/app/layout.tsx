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
  title: "Shortly — Fast, Reliable & Scalable URL Shortener",
  description:
    "Transform long links into short, memorable URLs with real-time click tracking, fast redirects, and analytics.",
  keywords: [
    "URL shortener",
    "short link",
    "link shortener",
    "click analytics",
    "scalable url shortener",
  ],
  authors: [{ name: "Shortly" }],
  openGraph: {
    title: "Shortly — Scalable URL Shortener",
    description:
      "Transform long links into short, memorable URLs with real-time click tracking.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 selection:bg-indigo-500 selection:text-white font-sans">
        {children}
      </body>
    </html>
  );
}
