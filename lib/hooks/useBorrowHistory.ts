'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BorrowHistory } from '@/types'

export function useBorrowHistory(bookId: string) {
  const [history, setHistory] = useState<BorrowHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    async function fetchHistory() {
      try {
        const { data, error: supabaseError } = await supabase
          .from('borrow_history')
          .select('*')
          .eq('book_id', bookId)
          .order('borrowed_at', { ascending: false })

        if (supabaseError) {
          throw new Error(supabaseError.message)
        }

        setHistory(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch borrow history')
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
