import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shelf",
  description: "The digital card catalog for the office library.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentYear = new Date().getFullYear();

  return (
    <html lang="en" data-theme="light" className="scroll-smooth">
      <body className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)] font-[family-name:var(--font-ui)]">
        <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] md:px-[var(--space-8)]">
          <div className="max-w-[1440px] mx-auto flex items-center justify-between">
            <span className="text-h2 font-medium tracking-tight">Shelf</span>
            <div className="flex items-center gap-[var(--space-4)]">
              {/* Navigation items would go here */}
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
      </body>
    </html>
  );
}
