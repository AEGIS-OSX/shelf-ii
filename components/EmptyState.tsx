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
      <h3
        className="font-[family-name:var(--font-display)] text-[var(--color-ink)] mb-[8px]"
        style={{ fontSize: "18px", lineHeight: "1.3", fontWeight: 500, letterSpacing: "-0.01em" }}
      >
        {title}
      </h3>
      {description && (
        <p
          className="text-[var(--color-ink-muted)] mb-[24px] max-w-[320px]"
          style={{ fontSize: "14px", lineHeight: "1.4" }}
        >
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
