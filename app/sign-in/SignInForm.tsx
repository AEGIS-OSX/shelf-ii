"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { motion } from "framer-motion";

interface SignInFormProps {
  redirectTo: string;
}

export default function SignInForm({ redirectTo }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  // Focus the email field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Focus trap: keep focus within the form while it is mounted
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      // On Escape, move focus to the email field (no close action since this is not a drawer)
      emailRef.current?.focus();
      return;
    }

    if (e.key !== "Tab") return;

    const form = formRef.current;
    if (!form) return;

    const focusable = form.querySelectorAll<HTMLElement>(
      "input, button, [tabindex]:not([tabindex='-1'])"
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    let valid = true;

    if (!email.trim()) {
      errors.email = "This field is required.";
      valid = false;
    }
    if (!password.trim()) {
      errors.password = "This field is required.";
      valid = false;
    }

    setFieldErrors(errors);
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    setLoading(true);

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // For now, accept any non-empty credentials as a demo flow
    // Real auth will be wired to Supabase in a later task
    if (email.trim() && password.trim()) {
      window.location.href = redirectTo;
    } else {
      setError("Incorrect email or password.");
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="rounded-[8px] border border-[var(--color-border)] bg-[var(--color-surface)] p-[var(--space-6)] shadow-sm"
    >
      <div className="space-y-[var(--space-4)]">
        {/* Email field */}
        <div>
          <label
            htmlFor="email"
            className="mb-[var(--space-1)] block text-[14px] leading-[1.4] font-[500] text-[var(--color-ink)]"
          >
            Email Address
          </label>
          <input
            ref={emailRef}
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="you@example.com"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            disabled={loading}
            className="w-full rounded-[4px] border border-[var(--color-border)] bg-[var(--color-canvas)] px-[var(--space-3)] py-[var(--space-2)] text-[15px] leading-[1.5] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] transition-colors duration-150 focus:border-[var(--color-focus)] focus:outline-none focus:ring-[2px] focus:ring-[var(--color-focus)] focus:ring-offset-[2px] focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50"
          />
          {fieldErrors.email && (
            <p id="email-error" className="mt-[var(--space-1)] text-[14px] leading-[1.4] text-[var(--color-checked-out)]" role="alert">
              {fieldErrors.email}
            </p>
          )}
        </div>

        {/* Password field */}
        <div>
          <label
            htmlFor="password"
            className="mb-[var(--space-1)] block text-[14px] leading-[1.4] font-[500] text-[var(--color-ink)]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password) {
                setFieldErrors((prev) => ({ ...prev, password: undefined }));
              }
            }}
            placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "password-error" : undefined}
            disabled={loading}
            className="w-full rounded-[4px] border border-[var(--color-border)] bg-[var(--color-canvas)] px-[var(--space-3)] py-[var(--space-2)] text-[15px] leading-[1.5] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] transition-colors duration-150 focus:border-[var(--color-focus)] focus:outline-none focus:ring-[2px] focus:ring-[var(--color-focus)] focus:ring-offset-[2px] focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50"
          />
          {fieldErrors.password && (
            <p id="password-error" className="mt-[var(--space-1)] text-[14px] leading-[1.4] text-[var(--color-checked-out)]" role="alert">
              {fieldErrors.password}
            </p>
          )}
        </div>

        {/* General error */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="text-[14px] leading-[1.4] text-[var(--color-checked-out)]"
            role="alert"
          >
            {error}
          </motion.p>
        )}

        {/* Submit button */}
        <button
          ref={submitRef}
          type="submit"
          disabled={loading}
          className="w-full rounded-[4px] bg-[var(--color-shelf-brown)] px-[var(--space-4)] py-[var(--space-2)] text-[15px] leading-[1.5] font-[500] text-[var(--color-surface)] transition-colors duration-150 hover:opacity-90 focus:outline-none focus:ring-[2px] focus:ring-[var(--color-focus)] focus:ring-offset-[2px] focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-[var(--space-2)]">
              <svg
                className="h-[16px] w-[16px] animate-spin text-[var(--color-surface)]"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Signing in&hellip;
            </span>
          ) : (
            "Sign In"
          )}
        </button>
      </div>
    </form>
  );
}
