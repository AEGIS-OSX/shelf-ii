"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { addBook } from "@/app/actions";

interface FieldState {
  value: string;
  touched: boolean;
  error: string | null;
}

function validateField(name: "title" | "author", value: string): string | null {
  if (!value.trim()) return `${name === "title" ? "Title" : "Author"} is required.`;
  return null;
}

export default function AddBookDrawer() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [title, setTitle] = useState<FieldState>({ value: "", touched: false, error: null });
  const [author, setAuthor] = useState<FieldState>({ value: "", touched: false, error: null });
  const [coverUrl, setCoverUrl] = useState("");

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();
  const titleErrorId = useId();
  const authorErrorId = useId();
  const formErrorId = useId();

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isValid =
    !validateField("title", title.value) && !validateField("author", author.value);

  const restoreFocus = useCallback(() => {
    requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setFormError(null);
    restoreFocus();
  }, [restoreFocus]);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function getFocusables() {
      return Array.from(drawer.querySelectorAll<HTMLElement>(focusableSelector)).filter(
        (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
      );
    }

    // Auto-focus first focusable
    const focusables = getFocusables();
    focusables[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeDrawer();
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
  }, [open, closeDrawer]);

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

    const tErr = validateField("title", title.value);
    const aErr = validateField("author", author.value);
    setTitle((s) => ({ ...s, touched: true, error: tErr }));
    setAuthor((s) => ({ ...s, touched: true, error: aErr }));

    if (tErr || aErr) return;

    setSubmitting(true);
    setFormError(null);

    const result = await addBook({
      title: title.value.trim(),
      author: author.value.trim(),
      cover_url: coverUrl.trim() || undefined,
    });

    setSubmitting(false);

    if (!result.success) {
      setFormError(result.error ?? "Failed to add book.");
      return;
    }

    // Reset and close on success
    setTitle({ value: "", touched: false, error: null });
    setAuthor({ value: "", touched: false, error: null });
    setCoverUrl("");
    closeDrawer();
  }

  const transitionDuration = reducedMotion ? "0ms" : "250ms";
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
        Add Book
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
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

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(100%, 28rem)",
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
            Add a Book
          </h2>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close add book drawer"
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
            <label htmlFor={titleId + "-title"} style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
              Title <span aria-label="required">*</span>
            </label>
            <input
              id={titleId + "-title"}
              type="text"
              value={title.value}
              onChange={(e) =>
                setTitle({ value: e.target.value, touched: title.touched, error: title.error })
              }
              onBlur={() =>
                setTitle({
                  value: title.value,
                  touched: true,
                  error: validateField("title", title.value),
                })
              }
              aria-invalid={!!(title.touched && title.error)}
              aria-describedby={title.touched && title.error ? titleErrorId : undefined}
              disabled={submitting}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--space-2)",
                border: `1px solid ${title.touched && title.error ? "rgb(220, 38, 38)" : "var(--color-border)"}`,
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
            {title.touched && title.error && (
              <span id={titleErrorId} style={{ fontSize: "0.875rem", color: "rgb(220, 38, 38)" }}>
                {title.error}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor={titleId + "-author"} style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
              Author <span aria-label="required">*</span>
            </label>
            <input
              id={titleId + "-author"}
              type="text"
              value={author.value}
              onChange={(e) =>
                setAuthor({ value: e.target.value, touched: author.touched, error: author.error })
              }
              onBlur={() =>
                setAuthor({
                  value: author.value,
                  touched: true,
                  error: validateField("author", author.value),
                })
              }
              aria-invalid={!!(author.touched && author.error)}
              aria-describedby={author.touched && author.error ? authorErrorId : undefined}
              disabled={submitting}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--space-2)",
                border: `1px solid ${author.touched && author.error ? "rgb(220, 38, 38)" : "var(--color-border)"}`,
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
            {author.touched && author.error && (
              <span id={authorErrorId} style={{ fontSize: "0.875rem", color: "rgb(220, 38, 38)" }}>
                {author.error}
              </span>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            <label htmlFor={titleId + "-cover"} style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
              Cover URL <span style={{ color: "var(--color-ink)", opacity: 0.6 }}>(optional)</span>
            </label>
            <input
              id={titleId + "-cover"}
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              disabled={submitting}
              style={{
                padding: "var(--space-3)",
                borderRadius: "var(--space-2)",
                border: "1px solid var(--color-border)",
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
            {submitting ? "Adding…" : "Add Book"}
          </button>
        </form>
      </div>
    </>
  );
}
