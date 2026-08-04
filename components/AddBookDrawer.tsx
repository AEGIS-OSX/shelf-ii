'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
// TODO: confirm exact export name from the books action module
import { createBook } from '@/app/actions/books';

type BookField = 'title' | 'author' | 'isbn' | 'genre';

type FormData = {
  title: string;
  author: string;
  isbn: string;
  genre: string;
};

type FormErrors = Partial<Record<BookField, string>>;

const initialForm: FormData = {
  title: '',
  author: '',
  isbn: '',
  genre: '',
};

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

function useFocusTrap(
  containerRef: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active || !containerRef.current) return;
    const container = containerRef.current;
    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(focusableSelector));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    // move focus to first focusable element when opened
    const focusable = getFocusable();
    if (focusable.length > 0) {
      focusable[0].focus();
    }
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [active, containerRef]);
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.title.trim()) errors.title = 'Title is required';
  if (!data.author.trim()) errors.author = 'Author is required';
  return errors;
}

export default function AddBookDrawer() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const reducedMotion = useReducedMotion();
  const router = useRouter();

  useFocusTrap(drawerRef, open);

  const openDrawer = useCallback(() => {
    lastFocused.current = document.activeElement as HTMLElement | null;
    setOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setOpen(false);
    setErrors({});
    setServerError(null);
  }, []);

  useEffect(() => {
    if (!open) {
      // restore focus after transition
      const id = setTimeout(() => {
        lastFocused.current?.focus();
      }, reducedMotion ? 0 : 250);
      return () => clearTimeout(id);
    }
  }, [open, reducedMotion]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        closeDrawer();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closeDrawer]);

  const updateField = (field: BookField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setServerError(null);
  };

  const onBlur = (field: BookField) => {
    const next = validate({ ...form, [field]: form[field] });
    setErrors((prev) => ({ ...prev, [field]: next[field] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validate(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setSubmitting(true);
    setServerError(null);
    try {
      await createBook(form);
      setForm(initialForm);
      closeDrawer();
      router.refresh();
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Failed to add book. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const transitionDuration = reducedMotion ? '0ms' : '250ms';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openDrawer}
        style={{
          fontFamily: 'var(--font-ui)',
          backgroundColor: 'var(--color-shelf-brown)',
          color: 'var(--color-canvas)',
          padding: 'var(--space-2) var(--space-4)',
          borderRadius: 'var(--space-1)',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1rem',
        }}
      >
        Add Book
      </button>

      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={closeDrawer}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.35)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
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
          position: 'fixed',
          top: 0,
          right: 0,
          width: 'min(100%, 28rem)',
          height: '100%',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-ink)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${transitionDuration} ease-out`,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: open ? '-4px 0 16px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <h2
            id={titleId}
            style={{
              margin: 0,
              fontFamily: 'var(--font-display)',
              fontSize: '1.25rem',
              fontWeight: 600,
            }}
          >
            Add a Book
          </h2>
          <button
            type="button"
            aria-label="Close add book drawer"
            onClick={closeDrawer}
            style={{
              fontFamily: 'var(--font-ui)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.25rem',
              lineHeight: 1,
              color: 'var(--color-ink-muted)',
              padding: 'var(--space-1)',
            }}
          >
            ×
          </button>
        </header>

        <form
          onSubmit={onSubmit}
          noValidate
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          {serverError && (
            <div
              role="alert"
              style={{
                backgroundColor: 'rgba(200,0,0,0.08)',
                color: '#a00',
                padding: 'var(--space-3)',
                borderRadius: 'var(--space-1)',
                fontFamily: 'var(--font-ui)',
                fontSize: '0.875rem',
              }}
            >
              {serverError}
            </div>
          )}

          <Field
            label="Title"
            id="book-title"
            required
            value={form.title}
            error={errors.title}
            onChange={(v) => updateField('title', v)}
            onBlur={() => onBlur('title')}
          />
          <Field
            label="Author"
            id="book-author"
            required
            value={form.author}
            error={errors.author}
            onChange={(v) => updateField('author', v)}
            onBlur={() => onBlur('author')}
          />
          <Field
            label="ISBN"
            id="book-isbn"
            value={form.isbn}
            error={errors.isbn}
            onChange={(v) => updateField('isbn', v)}
            onBlur={() => onBlur('isbn')}
          />
          <Field
            label="Genre"
            id="book-genre"
            value={form.genre}
            error={errors.genre}
            onChange={(v) => updateField('genre', v)}
            onBlur={() => onBlur('genre')}
          />

          <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%',
                fontFamily: 'var(--font-ui)',
                backgroundColor: submitting
                  ? 'var(--color-border)'
                  : 'var(--color-shelf-brown)',
                color: 'var(--color-canvas)',
                padding: 'var(--space-3) var(--space-4)',
                borderRadius: 'var(--space-1)',
                border: 'none',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                transition: `background-color ${transitionDuration} ease-out`,
              }}
            >
              {submitting ? 'Adding…' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

function Field({
  label,
  id,
  required,
  value,
  error,
  onChange,
  onBlur,
}: {
  label: string;
  id: string;
  required?: boolean;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const errorId = `${id}-error`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '0.875rem',
          fontWeight: 500,
          color: 'var(--color-ink)',
        }}
      >
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: '#a00', marginLeft: '0.25rem' }}>
            *
          </span>
        )}
      </label>
      <input
        id={id}
        name={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : undefined}
        required={required}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '1rem',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--space-1)',
          border: `1px solid ${error ? '#a00' : 'var(--color-border)'}`,
          backgroundColor: 'var(--color-canvas)',
          color: 'var(--color-ink)',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-focus)';
        }}
        onBlurCapture={(e) => {
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error && (
        <span
          id={errorId}
          role="alert"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '0.75rem',
            color: '#a00',
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
