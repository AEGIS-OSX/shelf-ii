'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BorrowHistory } from '@/types'

export function useBorrowHistory(bookId: string) {
  const [history, setHistory] = useState<BorrowHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchHistory() {
      try {
        setLoading(true)
        const { data, error: supabaseError } = await supabase
          .from('borrow_history')
          .select('*')
          .eq('book_id', bookId)
          .order('borrowed_at', { ascending: false })

        if (supabaseError) throw supabaseError
        setHistory(data ?? [])
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch borrow history'))
      } finally {
        setLoading(false)
      }
    }

    if (bookId) {
      fetchHistory()
    } else {
      setLoading(false)
    }
  }, [bookId])

  return { history, loading, error }
}
