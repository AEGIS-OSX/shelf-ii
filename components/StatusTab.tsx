"use client";

import React from "react";
import { motion } from "framer-motion";

interface StatusTabProps {
  activeTab: "available" | "checked-out";
  onTabChange: (tab: "available" | "checked-out") => void;
}

export const StatusTab: React.FC<StatusTabProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "available", label: "Available" },
    { id: "checked-out", label: "Checked Out" },
  ] as const;

  return (
    <div className="flex gap-[16px] border-b-[1px] border-[var(--color-border)]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative pb-[8px] font-[family-name:var(--font-ui)] transition-colors focus-visible:outline-none focus-visible:ring-[2px] focus-visible:ring-[var(--color-focus)] focus-visible:ring-offset-[2px] ${
            activeTab === tab.id
              ? "text-[var(--color-ink)]"
              : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
          }`}
          style={{ fontSize: "14px", lineHeight: "1.4" }}
        >
          {tab.label}
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--color-focus)]"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            />
          )}
        </button>
      ))}
    </div>
  );
};
