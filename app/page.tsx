"use client";

import { useState, useMemo, useCallback } from "react";
import { useBooks } from "@/lib/hooks/useBooks";
import { useBookMutations } from "@/lib/hooks/useBookMutations";
import { BookRow } from "@/components/BookRow";
import { SearchInput } from "@/components/SearchInput";

type StatusTabValue = "all" | "available" | "checked_out";

function mapStatus(status: "available" | "checked_out"): "available" | "checked-out" {
  return status === "checked_out" ? "checked-out" : "available";
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<StatusTabValue>("all");
  const [mutationError, setMutationError] = useState<string | null>(null);

  const { books, isLoading, error, refetch } = useBooks(search);
  const { checkoutBook, returnBook } = useBookMutations(refetch);

  const filteredBooks = useMemo(() => {
    if (activeTab === "all") return books;
    return books.filter((book) => book.status === activeTab);
  }, [books, activeTab]);

  const handleCheckout = useCallback(
    async (bookId: string) => {
      setMutationError(null);
      try {
        const result = await checkoutBook(bookId);
        if (!result?.success) {
          setMutationError(result?.error || "Check out failed. Please try again.");
        }
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : "Check out failed. Please try again.");
      }
    },
    [checkoutBook]
  );

  const handleReturn = useCallback(
    async (bookId: string) => {
      setMutationError(null);
      try {
        const result = await returnBook(bookId);
        if (!result?.success) {
          setMutationError(result?.error || "Return failed. Please try again.");
        }
      } catch (err) {
        setMutationError(err instanceof Error ? err.message : "Return failed. Please try again.");
      }
    },
    [returnBook]
  );

  const tabs: { label: string; value: StatusTabValue }[] = [
    { label: "All", value: "all" },
    { label: "Available", value: "available" },
    { label: "Checked Out", value: "checked_out" },
  ];

  const isEmptyCatalog = !isLoading && !error && books.length === 0 && !search && activeTab === "all";

  return (
    <section className="container mx-auto px-4 py-8" aria-label="Book catalog">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Catalog</h1>

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by title or author..."
        />
      </div>

      <div className="flex gap-6 mb-6 border-b border-gray-200" role="tablist" aria-label="Filter by status">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={activeTab === tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 text-sm font-medium transition-colors ${
              activeTab === tab.value
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mutationError && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
          {mutationError}
        </div>
      )}

      {isLoading && (
        <div className="py-12 text-center text-gray-500">Loading books...</div>
      )}

      {!isLoading && error && (
        <div className="py-12 text-center text-red-600">
          <p className="font-medium">Failed to load books</p>
          <p className="text-sm mt-1">{error instanceof Error ? error.message : "Please try again."}</p>
        </div>
      )}

      {!isLoading && !error && filteredBooks.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          {isEmptyCatalog ? (
            <>
              <p className="text-lg font-medium text-gray-700">No books yet</p>
              <p className="text-sm mt-1">The catalog is empty. Add some books to get started.</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-gray-700">No results</p>
              <p className="text-sm mt-1">No books match your search or filter.</p>
            </>
          )}
        </div>
      )}

      {!isLoading && !error && filteredBooks.length > 0 && (
        <div className="space-y-4">
          {filteredBooks.map((book) => (
            <BookRow
              key={book.id}
              title={book.title}
              author={book.author}
              coverSrc={book.cover_url ?? undefined}
              status={mapStatus(book.status)}
              borrowerName={book.borrower_name || ""}
              isSelf={false}
              history={[]}
              onCheckOut={() => handleCheckout(book.id)}
              onReturn={() => handleReturn(book.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
