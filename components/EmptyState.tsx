import React from "react";

interface EmptyStateProps {
  variant: "no-books" | "no-results";
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ variant, onAction }) => {
  const config = {
    "no-books": {
      title: "The library is empty.",
      description: "Add a book to get started.",
      actionLabel: "Add Book",
    },
    "no-results": {
      title: "No books match your search.",
      description: "Try adjusting your filters or search terms.",
      actionLabel: "Clear search",
    },
  };

  const { title, description, actionLabel } = config[variant];

  return (
    <div className="flex flex-col items-center justify-center py-[64px] px-[24px] text-center">
      <div className="w-[48px] h-[48px] mb-[16px] text-[var(--color-ink-muted)] opacity-20">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h3 className="text-[18px] font-[500] font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-[4px]">
        {title}
      </h3>
      <p className="text-[15px] font-[family-name:var(--font-ui)] text-[var(--color-ink-muted)] mb-[24px]">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="px-[16px] py-[8px] bg-[var(--color-shelf-brown)] text-[var(--color-surface)] rounded-[2px] text-[14px] font-[500] font-[family-name:var(--font-ui)] hover:opacity-90 transition-opacity focus-visible:ring-[2px] focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-[2px] outline-none"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
