"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Book } from "@/types"

interface BookWithBorrower extends Book {
  borrower_name: string | null
}

export function useBooks(search?: string) {
  const [books, setBooks] = useState<BookWithBorrower[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBooks = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false })

      if (search?.trim()) {
        const trimmed = search.trim()
        query = query.or(`title.ilike.%${trimmed}%,author.ilike.%${trimmed}%`)
      }

      const { data: booksData, error: booksError } = await query

      if (booksError) throw booksError

      const booksList = (booksData ?? []) as Book[]

      const borrowerIds = [...new Set(
        booksList
          .filter((book) => book.borrower_id)
          .map((book) => book.borrower_id as string)
      )]

      let profilesMap: Record<string, string> = {}
      if (borrowerIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", borrowerIds)

        if (profilesError) throw profilesError

        profilesMap = Object.fromEntries(
          (profilesData ?? []).map((p) => [p.user_id, p.display_name])
        )
      }

      const booksWithBorrower = booksList.map((book) => ({
        ...book,
        borrower_name: book.borrower_id ? (profilesMap[book.borrower_id] ?? null) : null,
      }))

      setBooks(booksWithBorrower)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch books"))
    } finally {
      setIsLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return { books, isLoading, error, refetch: fetchBooks }
}
