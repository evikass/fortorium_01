import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ФОРТОРИУМ - Анимационная студия будущего",
  description: "ФОРТОРИУМ - AI-powered animation studio for creating animated content with various styles including Disney, Ghibli, Anime, and Soviet animation styles.",
  keywords: ["ФОРТОРИУМ", "FORTORIUM", "animation", "AI", "studio", "Disney", "Ghibli", "Anime", "Soviet animation"],
  authors: [{ name: "FORTORIUM Team" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/logo.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "ФОРТОРИУМ - Анимационная студия будущего",
    description: "AI-powered animation studio for creating animated content",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
