"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { checkoutBook, returnBook } from "./actions";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import BookRow from "@/components/BookRow";
import type { Book } from "@/types";

type StatusFilter = "all" | "available" | "checked_out";

export default function HomePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [userId, setUserId] = useState<string | null>(null);
  const [actionErrorByBookId, setActionErrorByBookId] = useState<Record<string, string>>({});
  const [pendingBookId, setPendingBookId] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error: fetchError } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });
      if (fetchError) {
        setError(fetchError.message || "Failed to load books");
      } else {
        setBooks(data || []);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error loading books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        if (!cancelled) {
          setUserId(data.user?.id ?? null);
        }
      } catch {
        if (!cancelled) {
          setUserId(null);
        }
      }
      if (!cancelled) {
        await fetchBooks();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [fetchBooks]);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    const trimmedQuery = query.trim().toLowerCase();
    if (trimmedQuery) {
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(trimmedQuery) ||
          b.author.toLowerCase().includes(trimmedQuery)
      );
    }
    return result;
  }, [books, query, statusFilter]);

  const handleCheckOut = useCallback(
    async (bookId: string) => {
      setPendingBookId(bookId);
      setActionErrorByBookId((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
      try {
        const res = await checkoutBook(bookId);
        if (res.success) {
          await fetchBooks();
        } else {
          setActionErrorByBookId((prev) => ({ ...prev, [bookId]: res.error || "Check out failed" }));
        }
      } catch (e) {
        setActionErrorByBookId((prev) => ({
          ...prev,
          [bookId]: e instanceof Error ? e.message : "Check out failed",
        }));
      } finally {
        setPendingBookId(null);
      }
    },
    [fetchBooks]
  );

  const handleReturn = useCallback(
    async (bookId: string) => {
      setPendingBookId(bookId);
      setActionErrorByBookId((prev) => {
        const next = { ...prev };
        delete next[bookId];
        return next;
      });
      try {
        const res = await returnBook(bookId);
        if (res.success) {
          await fetchBooks();
        } else {
          setActionErrorByBookId((prev) => ({ ...prev, [bookId]: res.error || "Return failed" }));
        }
      } catch (e) {
        setActionErrorByBookId((prev) => ({
          ...prev,
          [bookId]: e instanceof Error ? e.message : "Return failed",
        }));
      } finally {
        setPendingBookId(null);
      }
    },
    [fetchBooks]
  );

  const tabs: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "available", label: "Available" },
    { key: "checked_out", label: "Checked Out" },
  ];

  return (
    <main style={{ padding: "var(--space-4)" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.75rem",
          fontWeight: 700,
          color: "var(--color-ink)",
          marginBottom: "var(--space-4)",
        }}
      >
        Catalog
      </h1>

      <div
        role="tablist"
        aria-label="Filter by status"
        style={{
          display: "flex",
          gap: "var(--space-2)",
          marginBottom: "var(--space-4)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        {tabs.map((t) => {
          const active = statusFilter === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              aria-pressed={active}
              onClick={() => setStatusFilter(t.key)}
              style={{
                padding: "var(--space-2) var(--space-3)",
                fontFamily: "var(--font-ui)",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: active ? "var(--color-ink)" : "var(--color-ink-muted)",
                borderBottom: active ? "2px solid var(--color-focus)" : "2px solid transparent",
                background: "none",
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                cursor: "pointer",
                transition: "color 150ms ease-out",
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{ marginBottom: "var(--space-4)" }}>
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search by title or author"
        />
      </div>

      {loading && (
        <p
          style={{
            fontFamily: "var(--font-ui)",
            color: "var(--color-ink-muted)",
            padding: "var(--space-8) 0",
            textAlign: "center",
          }}
        >
          Loading books…
        </p>
      )}

      {!loading && error && (
        <EmptyState title="Couldn’t load books" description={error} />
      )}

      {!loading && !error && books.length === 0 && (
        <EmptyState
          title="No books yet"
          description="Add a book to get started."
        />
      )}

      {!loading && !error && books.length > 0 && filteredBooks.length === 0 && (
        <EmptyState
          title="No matches"
          description="Try a different search or filter."
        />
      )}

      {!loading &&
        !error &&
        filteredBooks.map((book) => {
          const isSelf = book.borrower_id === userId;
          const statusForRow: "available" | "checked-out" =
            book.status === "available" ? "available" : "checked-out";
          const isPending = pendingBookId === book.id;

          return (
            <div key={book.id} style={{ marginBottom: "var(--space-3)" }}>
              <BookRow
                title={book.title}
                author={book.author}
                coverSrc={book.cover_url ?? undefined}
                status={statusForRow}
                borrowerName={isSelf ? undefined : book.borrower_id ? "another member" : undefined}
                isSelf={isSelf}
                history={[]}
                onCheckOut={
                  book.status === "available"
                    ? () => handleCheckOut(book.id)
                    : undefined
                }
                onReturn={
                  book.status === "checked_out"
                    ? () => handleReturn(book.id)
                    : undefined
                }
              />
              {isPending && (
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.75rem",
                    color: "var(--color-ink-muted)",
                    marginTop: "var(--space-1)",
                  }}
                >
                  Working…
                </p>
              )}
              {actionErrorByBookId[book.id] && !isPending && (
                <p
                  style={{
                    fontFamily: "var(--font-ui)",
                    fontSize: "0.75rem",
                    color: "var(--color-checked-out)",
                    marginTop: "var(--space-1)",
                  }}
                >
                  {actionErrorByBookId[book.id]}
                </p>
              )}
            </div>
          );
        })}
    </main>
  );
}
