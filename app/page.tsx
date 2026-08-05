"use client";

import { useState } from "react";
import { BookCover } from "@/components/BookCover";
import { BookRow } from "@/components/BookRow";
import { EmptyState } from "@/components/EmptyState";
import { SearchInput } from "@/components/SearchInput";
import { StatusTab } from "@/components/StatusTab";
import ThemeProvider from "@/components/ThemeProvider";
import TopBar from "@/components/TopBar";
import { DataTable, Column } from "@/components/ui/data-table";
import { Sidebar } from "@/components/ui/sidebar";

type TableRow = {
  title: string;
  author: string;
  status: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"available" | "checked-out">("available");
  const [searchValue, setSearchValue] = useState("");

  const sidebarItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings", href: "/settings" },
  ];

  const bookHistory = [
    { name: "Alice", date: "2024-01-15" },
  ];

  const columns: Column<TableRow>[] = [
    { key: "title", label: "Title" },
    { key: "author", label: "Author" },
    { key: "status", label: "Status" },
  ];

  const rows: TableRow[] = [
    { title: "Sample Book", author: "Sample Author", status: "Available" },
  ];

  return (
    <ThemeProvider>
      <main>
        <TopBar />
        <Sidebar items={sidebarItems} />
        <StatusTab activeTab={activeTab} onTabChange={setActiveTab} />
        <SearchInput value={searchValue} onChange={setSearchValue} />
        <BookRow
          title="Sample Book"
          author="Sample Author"
          status="available"
          history={bookHistory}
        />
        <BookCover title="Sample Book" />
        <EmptyState
          title="No books found"
          description="Try adjusting your search or filters."
        />
        <DataTable columns={columns} rows={rows} />
      </main>
    </ThemeProvider>
  );
}
