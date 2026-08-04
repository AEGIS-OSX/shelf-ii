import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shelf",
  description: "The digital card catalog for the office library.",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-[family-name:var(--font-ui)]">
        <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] md:px-[var(--space-8)]">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <span className="text-h2 font-medium tracking-tight">Shelf</span>
            <div className="flex items-center gap-[var(--space-4)]">
              <button
                id="theme-toggle"
                type="button"
                className="text-caption text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors"
                aria-label="Toggle theme"
              >
                Light / Dark
              </button>
            </div>
          </div>
        </nav>

        <main className="flex-grow max-w-[1440px] mx-auto w-full px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)] md:py-[var(--space-10)]">
          {children}
        </main>

        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)]">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-[var(--space-4)]">
            <p className="text-caption text-[var(--color-ink-muted)]">
              &copy; {currentYear} Shelf. All rights reserved.
            </p>
            <div className="flex gap-[var(--space-6)] text-caption text-[var(--color-ink-muted)]">
              {/* Footer links would go here */}
            </div>
          </div>
        </footer>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const btn = document.getElementById('theme-toggle');
                if (!btn) return;
                btn.addEventListener('click', function() {
                  const html = document.documentElement;
                  const current = html.getAttribute('data-theme');
                  const next = current === 'dark' ? 'light' : 'dark';
                  html.setAttribute('data-theme', next);
                  localStorage.setItem('theme', next);
                });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
