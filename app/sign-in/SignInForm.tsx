'use client';

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

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

export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const reducedMotion = useReducedMotion();
  const router = useRouter();
  const errorId = useId();

  const transitionDuration = reducedMotion ? '0ms' : '200ms';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message || 'Invalid email or password.');
        return;
      }
      router.push('/');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // focus first field on mount
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
        backgroundColor: 'var(--color-canvas)',
        color: 'var(--color-ink)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '24rem',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--space-2)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-6)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}
      >
        <h1
          style={{
            margin: `0 0 var(--space-6)`,
            fontFamily: 'var(--font-display)',
            fontSize: '1.5rem',
            fontWeight: 600,
            textAlign: 'center',
          }}
        >
          Sign In
        </h1>

        {error && (
          <div
            id={errorId}
            role="alert"
            style={{
              backgroundColor: 'rgba(200,0,0,0.08)',
              color: '#a00',
              padding: 'var(--space-3)',
              borderRadius: 'var(--space-1)',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-4)',
            }}
          >
            {error}
          </div>
        )}

        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label
              htmlFor="signin-email"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              Email
            </label>
            <input
              ref={emailRef}
              id="signin-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1rem',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--space-1)',
                border: `1px solid ${error ? '#a00' : 'var(--color-border)'}`,
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',
                outline: 'none',
                transition: `border-color ${transitionDuration} ease-out, box-shadow ${transitionDuration} ease-out`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-focus)';
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <label
              htmlFor="signin-password"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-ink)',
              }}
            >
              Password
            </label>
            <input
              id="signin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
              }}
              disabled={loading}
              aria-invalid={!!error}
              aria-describedby={error ? errorId : undefined}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '1rem',
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--space-1)',
                border: `1px solid ${error ? '#a00' : 'var(--color-border)'}`,
                backgroundColor: 'var(--color-canvas)',
                color: 'var(--color-ink)',
                outline: 'none',
                transition: `border-color ${transitionDuration} ease-out, box-shadow ${transitionDuration} ease-out`,
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-focus)';
              }}
              onBlurCapture={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 'var(--space-2)',
              fontFamily: 'var(--font-ui)',
              backgroundColor: loading
                ? 'var(--color-border)'
                : 'var(--color-shelf-brown)',
              color: 'var(--color-canvas)',
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--space-1)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: 500,
              transition: `background-color ${transitionDuration} ease-out, transform ${transitionDuration} ease-out`,
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
