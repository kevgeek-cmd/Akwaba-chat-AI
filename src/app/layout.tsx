import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { PwaManager } from "@/components/pwa/PwaManager";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Akwaba Chat | Assistant IA Moderne, Rapide & Responsive",
  description: "Akwaba Chat est un assistant IA inspiré de ChatGPT, puissant, fluide et sécurisé aux couleurs de la Côte d'Ivoire.",
  keywords: ["AI", "Chat", "Akwaba", "Next.js", "PWA", "Côte d'Ivoire", "IA Ivoirienne"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Akwaba Chat",
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#009A44" },
    { media: "(prefers-color-scheme: dark)", color: "#022c22" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('akwaba-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${inter.className} h-full bg-akwaba-bg-light dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans`}
        suppressHydrationWarning
      >
        <PwaManager />
        {children}
      </body>
    </html>
  );
}

