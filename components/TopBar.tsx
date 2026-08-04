"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function TopBar() {
  const pathname = usePathname();
  const isSignInPage = pathname === "/sign-in";
  const { theme, toggleTheme } = useTheme();

  // TODO: Replace with real auth hook when available
  const [user, setUser] = useState<{ email: string } | null>(null);

  if (isSignInPage) return null;

  return (
    <header className="sticky top-0 z-50 h-[56px] w-full border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-[var(--space-4)] md:px-[var(--space-8)]">
        <div className="flex items-center gap-[var(--space-6)]">
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-[18px] font-medium tracking-tight text-[var(--color-ink)] transition-opacity hover:opacity-80"
          >
            Shelf
          </Link>
        </div>

        <div className="flex items-center gap-[var(--space-4)]">
          <button
            onClick={toggleTheme}
            className="font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-2"
            aria-label="Toggle theme"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>

          <div className="h-[16px] w-[1px] bg-[var(--color-border)]" aria-hidden="true" />

          {user ? (
            <div className="flex items-center gap-[var(--space-3)]">
              <span className="hidden font-[family-name:var(--font-ui)] text-[14px] text-[var(--color-ink-muted)] md:block">
                {user.email}
              </span>
              <button
                onClick={() => setUser(null)}
                className="font-[family-name:var(--font-ui)] text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-shelf-brown)]"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="font-[family-name:var(--font-ui)] text-[14px] font-medium text-[var(--color-ink)] transition-colors hover:text-[var(--color-shelf-brown)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
