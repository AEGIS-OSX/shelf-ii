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
        <div className="mb-[16px] text-[var(--color-text-secondary)]">
          {icon}
        </div>
      )}
      <h3 className="text-[18px] font-semibold text-[var(--color-text-primary)] mb-[8px]">
        {title}
      </h3>
      {description && (
        <p className="text-[14px] text-[var(--color-text-secondary)] mb-[24px] max-w-[320px]">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
