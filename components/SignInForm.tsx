"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface FieldState {
  value: string;
  touched: boolean;
  error: string | null;
}

function validateField(name: "email" | "password", value: string): string | null {
  if (!value.trim()) return `${name === "email" ? "Email" : "Password"} is required.`;
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return "Enter a valid email address.";
  }
  return null;
}

export default function SignInForm() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [email, setEmail] = useState<FieldState>({ value: "", touched: false, error: null });
  const [password, setPassword] = useState<FieldState>({ value: "", touched: false, error: null });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const emailErrorId = useId();
  const passwordErrorId = useId();
  const formErrorId = useId();

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isValid =
    !validateField("email", email.value) && !validateField("password", password.value);

  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const closeDialog = useCallback(() => {
    setOpen(false);
    setFormError(null);
    restoreFocus();
  }, [restoreFocus]);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    const dialogEl: HTMLDivElement = dialog;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function getFocusables() {
      return Array.from(dialogEl.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
    }

    const focusables = getFocusables();
    focusables[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (e.key !== "Tab") return;

      const items = getFocusables();
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, closeDialog]);

  // Prevent body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const eErr = validateField("email", email.value);
    const pErr = validateField("password", password.value);
    setEmail((s) => ({ ...s, touched: true, error: eErr }));
    setPassword((s) => ({ ...s, touched: true, error: pErr }));

    if (eErr || pErr) return;

    setSubmitting(true);
    setFormError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message ?? "Sign in failed. Check your credentials and try again.");
      return;
    }

    setEmail({ value: "", touched: false, error: null });
    setPassword({ value: "", touched: false, error: null });
    setOpen(false);
    router.push("/");
  }

  const transitionDuration = reducedMotion ? "0ms" : "200ms";
  const transform = open ? "translateX(0)" : "translateX(100%)";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        style={{
          padding: "var(--space-3) var(--space-4)",
          backgroundColor: "var(--color-shelf-brown)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--space-2)",
          cursor: "pointer",
        }}
      >
        Sign In
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDialog}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: `opacity ${transitionDuration} ease-out`,
          zIndex: 40,
        }}
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100%, 24rem)",
          backgroundColor: "var(--color-surface)",
          borderLeft: "1px solid var(--color-border)",
          transform,
          transition: `transform ${transitionDuration} ease-out`,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "var(--space-4)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <h2 id={titleId} style={{ margin: 0, fontSize: "1.25rem", color: "var(--color-ink)" }}>
            Sign In
          </h2>
          <button
            type="button"
            onClick={closeDialog}
            aria-label="Close sign in dialog"
            style={{
              background: "none",
              border: "none",
              color: "var(--color-ink)",
              cursor: "pointer",
              fontSize: "1.25rem",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--space-4)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          {formError && (
            <p
              id={formErrorId}
              role="alert"
              style={{
                margin: 0,
                padding: "var(--space-3)",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                color: "rgb(185, 28, 28)",
                borderRadius: "var(--space-2)",
                fontSize: "0.875rem",
              }}
            >
              {formError}
            </p>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor={titleId + "-email"} style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
              Email <span aria-label="required">*</span>
            </label>
            <input
              id={titleId + "-email"}
              type="email"
              autoComplete="email"
              value={email.value}
              onChange={(e) =>
                setEmail({ value: e.target.value, touched: email.touched, error: email.error })
              }
              onBlur={() =>
                setEmail({
                  value: email.value,
                  touched: true,
                  error: validateField("email", email.value),
                })
              }
              aria-invalid={!!(email.touched && email.error)}
              aria-describedby={email.touched && email.error ? emailErrorId : undefined}
              disabled={submitting}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--space-2)",
                border: `1px solid ${email.touched && email.error ? "rgb(220, 38, 38)" : "var(--color-border)"}`,
                backgroundColor: "var(--color-canvas)",
                color: "var(--color-ink)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-focus)`;
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {email.touched && email.error && (
              <span id={emailErrorId} style={{ fontSize: "0.875rem", color: "rgb(220, 38, 38)" }}>
                {email.error}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor={titleId + "-password"} style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
              Password <span aria-label="required">*</span>
            </label>
            <input
              id={titleId + "-password"}
              type="password"
              autoComplete="current-password"
              value={password.value}
              onChange={(e) =>
                setPassword({ value: e.target.value, touched: password.touched, error: password.error })
              }
              onBlur={() =>
                setPassword({
                  value: password.value,
                  touched: true,
                  error: validateField("password", password.value),
                })
              }
              aria-invalid={!!(password.touched && password.error)}
              aria-describedby={password.touched && password.error ? passwordErrorId : undefined}
              disabled={submitting}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--space-2)",
                border: `1px solid ${password.touched && password.error ? "rgb(220, 38, 38)" : "var(--color-border)"}`,
                backgroundColor: "var(--color-canvas)",
                color: "var(--color-ink)",
                outline: "none",
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px var(--color-focus)`;
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {password.touched && password.error && (
              <span id={passwordErrorId} style={{ fontSize: "0.875rem", color: "rgb(220, 38, 38)" }}>
                {password.error}
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || !isValid}
            style={{
              marginTop: "auto",
              padding: "var(--space-3) var(--space-4)",
              backgroundColor: "var(--color-shelf-brown)",
              color: "#fff",
              border: "none",
              borderRadius: "var(--space-2)",
              cursor: submitting || !isValid ? "not-allowed" : "pointer",
              opacity: submitting || !isValid ? 0.6 : 1,
            }}
          >
            {submitting ? "Signing in\u2026" : "Sign In"}
          </button>
        </form>
      </div>
    </>
  );
}
