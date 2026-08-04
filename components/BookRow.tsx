"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookCover } from "./BookCover";

interface HistoryEntry {
  name: string;
  date: string;
  isCurrent?: boolean;
}

interface BookRowProps {
  title: string;
  author: string;
  coverSrc?: string;
  status: "available" | "checked-out";
  borrowerName?: string;
  isSelf?: boolean;
  history: HistoryEntry[];
  onCheckOut?: () => void;
  onReturn?: () => void;
}

export const BookRow: React.FC<BookRowProps> = ({
  title,
  author,
  coverSrc,
  status,
  borrowerName,
  isSelf,
  history,
  onCheckOut,
  onReturn,
}) => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const statusLabel = status === "available" 
    ? "Available" 
    : isSelf 
      ? "Checked out to You" 
      : `Checked out to ${borrowerName}`;

  const statusColor = status === "available" 
    ? "text-[var(--color-available)]" 
    : "text-[var(--color-checked-out)]";

  return (
    <div className="flex flex-col border-b-[1px] border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-[16px] py-[16px] px-[4px]">
        <BookCover title={title} src={coverSrc} size="sm" />
        
        <div className="flex-grow min-w-0">
          <h3 className="text-[length:var(--text-h2)] font-[500] font-[family-name:var(--font-display)] text-[var(--color-ink)] truncate">
            {title}
          </h3>
          <p className="text-[length:var(--text-body)] font-[family-name:var(--font-ui)] text-[var(--color-ink-muted)] truncate">
            {author}
          </p>
        </div>

        <div className="flex items-center gap-[24px]">
          <div className={`text-[length:var(--text-caption)] font-[family-name:var(--font-ui)] ${statusColor} whitespace-nowrap`}>
            {statusLabel}
          </div>

          <div className="flex items-center gap-[8px]">
            {status === "available" ? (
              <button
                onClick={onCheckOut}
                className="px-[12px] py-[6px] bg-[var(--color-shelf-brown)] text-[var(--color-surface)] rounded-[2px] text-[length:var(--text-caption)] font-[500] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity focus-visible:ring-[2px] focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-[2px] outline-none"
              >
                Check Out
              </button>
            ) : isSelf ? (
              <button
                onClick={onReturn}
                className="px-[12px] py-[6px] border-[1px] border-[var(--color-shelf-brown)] text-[var(--color-shelf-brown)] rounded-[2px] text-[length:var(--text-caption)] font-[500] font-[family-name:var(--font-ui)] hover:bg-[var(--color-canvas)] transition-colors focus-visible:ring-[2px] focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-[2px] outline-none"
              >
                Return
              </button>
            ) : null}

            <button
              onClick={() => setIsHistoryOpen(!isHistoryOpen)}
              className="flex items-center gap-[4px] px-[8px] py-[4px] text-[length:var(--text-caption)] font-[family-name:var(--font-ui)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] transition-colors focus-visible:ring-[2px] focus-visible:ring-[var(--color-focus)] rounded-[2px] outline-none"
              aria-label="Toggle borrow history"
            >
              Borrow History
              <motion.svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                animate={{ rotate: isHistoryOpen ? 180 : 0 }}
              >
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isHistoryOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="pb-[16px] pl-[68px] pr-[4px]">
              <h4 className="text-[length:var(--text-mono-label)] font-[family-name:var(--font-mono)] text-[var(--color-ink-muted)] uppercase tracking-wider mb-[8px]">
                History
              </h4>
              <div className="space-y-[4px]">
                {history.length > 0 ? (
                  history.map((entry, idx) => (
                    <div key={idx} className="text-[length:var(--text-caption)] font-[family-name:var(--font-ui)] text-[var(--color-ink)]">
                      {entry.name} — {entry.date}{entry.isCurrent ? " to Present" : ""}
                    </div>
                  ))
                ) : (
                  <div className="text-[length:var(--text-caption)] font-[family-name:var(--font-ui)] text-[var(--color-ink-muted)]">
                    No one has borrowed this book yet.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
