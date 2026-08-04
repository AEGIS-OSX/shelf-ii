"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { BorrowHistory } from "@/types";

export interface UseBorrowHistoryResult {
  history: BorrowHistory[];
  isLoading: boolean;
}

export function useBorrowHistory(bookId: string): UseBorrowHistoryResult {
  const [history, setHistory] = useState<BorrowHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);

      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("borrow_history")
          .select("*")
          .eq("book_id", bookId)
          .order("borrowed_at", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        const historyList = (data || []) as BorrowHistory[];
        const borrowerIds = historyList
          .map((h) => h.borrower_id)
          .filter((id): id is string => Boolean(id));

        let profilesMap: Record<string, string> = {};
        if (borrowerIds.length > 0) {
          const { data: profilesData } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", borrowerIds);

          if (profilesData) {
            profilesMap = Object.fromEntries(
              profilesData.map((p) => [p.user_id, p.display_name])
            );
          }
        }

        const historyWithNames: BorrowHistory[] = historyList.map((h) => ({
          ...h,
          borrower_name: h.borrower_name || profilesMap[h.borrower_id] || "Unknown",
        }));

        setHistory(historyWithNames);
      } catch {
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookId) {
      fetchHistory();
    } else {
      setHistory([]);
      setIsLoading(false);
    }
  }, [bookId]);

  return { history, isLoading };
}
