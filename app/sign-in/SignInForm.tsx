"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SignInFormProps {
  redirectTo: string;
}

export default function SignInForm({ redirectTo }: SignInFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(redirectTo);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      {error && (
        <p
          role="alert"
          style={{
            margin: 0,
            padding: "var(--space-3)",
            backgroundColor: "rgba(220, 38, 38, 0.1)",
            color: "rgb(185, 28, 28)",
            borderRadius: "var(--space-2)",
            fontSize: "0.875rem",
            animation: reducedMotion ? "none" : "shake 200ms ease-out",
          }}
        >
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label htmlFor="signin-email" style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
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
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
        <label htmlFor="signin-password" style={{ fontSize: "0.875rem", color: "var(--color-ink)" }}>
          Password
        </label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
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
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: "var(--space-3) var(--space-4)",
          backgroundColor: "var(--color-shelf-brown)",
          color: "#fff",
          border: "none",
          borderRadius: "var(--space-2)",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
