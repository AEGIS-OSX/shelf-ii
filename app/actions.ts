"use server"

import { createServerClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function addBook({
  title,
  author,
  cover_url,
}: {
  title: string;
  author: string;
  cover_url?: string;
}): Promise<ActionResult> {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase.from("books").insert({
    title,
    author,
    cover_url: cover_url ?? null,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function checkoutBook(bookId: string): Promise<ActionResult> {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: rows, error: updateError } = await supabase
    .from("books")
    .update({ status: "checked_out", borrower_id: user.id })
    .eq("id", bookId)
    .eq("status", "available")
    .is("borrower_id", null)
    .select();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (!rows || rows.length === 0) {
    return { success: false, error: "Book is not available" };
  }

  const { error: historyError } = await supabase.from("borrow_history").insert({
    book_id: bookId,
    borrower_id: user.id,
    borrowed_at: new Date().toISOString(),
  });

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  return { success: true };
}

export async function returnBook(bookId: string): Promise<ActionResult> {
  const supabase = createServerClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: rows, error: updateError } = await supabase
    .from("books")
    .update({ status: "available", borrower_id: null })
    .eq("id", bookId)
    .eq("borrower_id", user.id)
    .select();

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  if (!rows || rows.length === 0) {
    return { success: false, error: "Book not found or not checked out by you" };
  }

  const { error: historyError } = await supabase
    .from("borrow_history")
    .update({ returned_at: new Date().toISOString() })
    .eq("book_id", bookId)
    .eq("borrower_id", user.id)
    .is("returned_at", null);

  if (historyError) {
    return { success: false, error: historyError.message };
  }

  return { success: true };
}
