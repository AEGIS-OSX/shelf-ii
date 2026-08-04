-- Shelf II: Initial schema and RLS policies
-- Created: 2026-08-04

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Books table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.books (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text NOT NULL,
    author      text NOT NULL,
    cover_url   text,
    status      text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
    borrower_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.books IS 'Catalog of books in the office library.';
COMMENT ON COLUMN public.books.status IS 'availability status: available or checked_out';
COMMENT ON COLUMN public.books.borrower_id IS 'current borrower, null when available';

-- ============================================================
-- Borrow history ledger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.borrow_history (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id     uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    borrower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    borrowed_at timestamptz DEFAULT now(),
    returned_at timestamptz
);

COMMENT ON TABLE public.borrow_history IS 'Ledger of all borrow and return transactions.';

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_history ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Books policies
-- --------------------------------------------------------
-- Allow anonymous and authenticated users to read the catalog
CREATE POLICY "Allow public select on books"
    ON public.books
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to add new books
CREATE POLICY "Allow authenticated insert on books"
    ON public.books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update book records (check out / return)
CREATE POLICY "Allow authenticated update on books"
    ON public.books
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --------------------------------------------------------
-- Borrow history policies
-- --------------------------------------------------------
-- Allow anonymous and authenticated users to read the ledger
CREATE POLICY "Allow public select on borrow_history"
    ON public.borrow_history
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Allow authenticated users to record borrow transactions
CREATE POLICY "Allow authenticated insert on borrow_history"
    ON public.borrow_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update borrow records (e.g. set returned_at)
CREATE POLICY "Allow authenticated update on borrow_history"
    ON public.borrow_history
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
