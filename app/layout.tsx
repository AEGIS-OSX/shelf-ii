import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import TopBar from "@/components/TopBar";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Shelf",
  description: "The digital card catalog for the office library.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-[family-name:var(--font-ui)] antialiased">
        <ThemeProvider>
          <TopBar />

          <main className="flex-grow max-w-[1440px] mx-auto w-full px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)] md:py-[var(--space-10)]">
            {children}
          </main>

          <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)]">
            <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-4)]">
              <p className="font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-ink-muted)]">
                &copy; {new Date().getFullYear()} Shelf. All rights reserved.
              </p>
              <div className="flex gap-[var(--space-6)] font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-ink-muted)]">
                {/* Footer links */}
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
