"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/types";

export interface BookWithBorrowerName extends Book {
  borrower_name: string | null;
}

export interface UseBooksResult {
  books: BookWithBorrowerName[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useBooks(search?: string): UseBooksResult {
  const [books, setBooks] = useState<BookWithBorrowerName[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      let query = supabase.from("books").select("*");

      if (search && search.trim()) {
        const term = search.trim();
        query = query.or(`title.ilike.%${term}%,author.ilike.%${term}%`);
      }

      const { data: booksData, error: booksError } = await query;

      if (booksError) {
        throw new Error(booksError.message);
      }

      const booksList = (booksData || []) as Book[];
      const borrowerIds = booksList
        .map((b) => b.borrower_id)
        .filter((id): id is string => id !== null);

      let profilesMap: Record<string, string> = {};
      if (borrowerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", borrowerIds);

        if (!profilesError && profilesData) {
          profilesMap = Object.fromEntries(
            profilesData.map((p) => [p.user_id, p.display_name])
          );
        }
      }

      const booksWithNames: BookWithBorrowerName[] = booksList.map((book) => ({
        ...book,
        borrower_name: book.borrower_id ? profilesMap[book.borrower_id] || null : null,
      }));

      setBooks(booksWithNames);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch books"));
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { books, isLoading, error, refetch: fetchBooks };
}
