import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Linkly — Scalable URL Infrastructure & Real-Time Analytics",
  description:
    "Lightning-fast URL shortening, custom branded aliases, automated expiration policies, dynamic QR codes, and sub-10ms global edge redirects.",
  keywords: [
    "Linkly",
    "URL shortener",
    "short link",
    "vanity url",
    "click analytics",
    "QR codes",
    "edge redirect",
    "Redis",
  ],
  authors: [{ name: "Linkly" }],
  openGraph: {
    title: "Linkly — Scalable URL Infrastructure & Real-Time Analytics",
    description:
      "Lightning-fast URL shortening, custom branded aliases, automated expiration policies, dynamic QR codes, and sub-10ms global edge redirects.",
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
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-surface text-on-surface font-sans selection:bg-primary-container selection:text-on-primary"
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
