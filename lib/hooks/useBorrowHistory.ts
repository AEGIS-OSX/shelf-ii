"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { BorrowHistory } from "@/types"

interface HistoryWithBorrower extends BorrowHistory {
  borrower_name: string
}

export function useBorrowHistory(bookId: string) {
  const [history, setHistory] = useState<HistoryWithBorrower[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchHistory = useCallback(async () => {
    if (!bookId) {
      setHistory([])
      setIsLoading(false)
      setError(null)
      return
    }

    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: historyData, error: historyError } = await supabase
        .from("borrow_history")
        .select("*")
        .eq("book_id", bookId)
        .order("borrowed_at", { ascending: false })

      if (historyError) throw historyError

      const historyList = (historyData ?? []) as BorrowHistory[]

      const borrowerIds = [...new Set(
        historyList
          .map((h) => h.borrower_id)
          .filter((id): id is string => Boolean(id))
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

      const historyWithBorrower = historyList.map((entry) => ({
        ...entry,
        borrower_name: profilesMap[entry.borrower_id] ?? entry.borrower_id ?? "Unknown",
      }))

      setHistory(historyWithBorrower)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch borrow history"))
    } finally {
      setIsLoading(false)
    }
  }, [bookId])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return { history, isLoading, error, refetch: fetchHistory }
}
