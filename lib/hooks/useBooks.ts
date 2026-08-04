'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Book } from '@/types'

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchBooks() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('books')
          .select('*')
          .order('created_at', { ascending: false })

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        setBooks(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books')
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  return { books, loading, error }
}
