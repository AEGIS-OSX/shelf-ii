'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Book } from '@/types'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchBooks() {
      try {
        setLoading(true)
        const { data, error: supabaseError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) throw supabaseError
        setBooks(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch books'))
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  return { books, loading, error }
}
