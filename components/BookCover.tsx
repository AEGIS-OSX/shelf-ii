import React from "react";

interface BookCoverProps {
  title: string;
  src?: string;
  size?: "sm" | "md";
}

export const BookCover: React.FC<BookCoverProps> = ({ title, src, size = "md" }) => {
  const width = size === "sm" ? "w-[48px]" : "w-[64px]";
  const height = size === "sm" ? "h-[64px]" : "h-[85px]"; // 3/4 aspect ratio

  return (
    <div
      className={`${width} ${height} flex-shrink-0 rounded-[4px] border-[1px] border-[var(--color-shelf-brown)] bg-[var(--color-surface)] overflow-hidden flex items-center justify-center`}
      aria-label={`Cover for ${title}`}
    >
      {src ? (
        <img
          src={src}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center p-[4px] text-center">
          <span className="text-[length:var(--text-caption)] font-[family-name:var(--font-mono)] uppercase tracking-wider text-[var(--color-shelf-brown)] leading-tight">
            {title.split(" ").map((word) => word[0]).join("").slice(0, 3)}
          </span>
        </div>
      )}
    </div>
  );
};
