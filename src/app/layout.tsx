import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Akwaba Chat | Assistant IA Moderne, Rapide & Responsive",
  description: "Akwaba Chat est un mini assistant IA inspiré de ChatGPT, puissant, fluide et sécurisé aux couleurs de la Côte d'Ivoire.",
  keywords: ["AI", "Chat", "Akwaba", "Next.js", "OpenRouter", "Côte d'Ivoire"],
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
      <body className="h-full bg-akwaba-bg-light dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

