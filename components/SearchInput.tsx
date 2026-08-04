"use client";

import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search by title or author",
}) => {
  return (
    <div className="relative flex items-center w-full group">
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute left-0 text-[var(--color-ink-muted)] group-focus-within:text-[var(--color-focus)] transition-colors"
      >
        <path
          d="M7.33333 12.6667C10.2789 12.6667 12.6667 10.2789 12.6667 7.33333C12.6667 4.38781 10.2789 2 7.33333 2C4.38781 2 2 4.38781 2 7.33333C2 10.2789 4.38781 12.6667 7.33333 12.6667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14 14L11.1 11.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent pl-[24px] py-[8px] border-b-[1px] border-[var(--color-border)] focus:border-[var(--color-focus)] outline-none text-[length:var(--text-body)] font-[family-name:var(--font-ui)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-0 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] p-[4px]"
          aria-label="Clear search"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};
