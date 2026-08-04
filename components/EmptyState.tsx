"use client";

import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[64px] px-[24px] text-center">
      {icon && (
        <div className="mb-[16px] text-[var(--color-ink-muted)]">
          {icon}
        </div>
      )}
      <h3 className="text-[length:var(--text-h2)] font-[500] text-[var(--color-ink)] mb-[8px]">
        {title}
      </h3>
      {description && (
        <p className="text-[length:var(--text-caption)] text-[var(--color-ink-muted)] mb-[24px] max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
