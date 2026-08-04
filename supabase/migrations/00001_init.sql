-- Shelf II: Initial schema and RLS policies
-- Created: 2026-08-04

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Profiles table (extends auth.users for public access)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name  text,
    created_at timestamptz DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Public user profiles extending Supabase auth.users.';
COMMENT ON COLUMN public.profiles.full_name IS 'Display name of the user.';

-- ============================================================
-- Books table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.books (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title       text NOT NULL,
    author      text NOT NULL,
    cover_url   text,
    status      text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
    borrower_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  timestamptz DEFAULT now(),
    updated_at  timestamptz DEFAULT now()
);

COMMENT ON TABLE public.books IS 'Catalog of books in the office library.';
COMMENT ON COLUMN public.books.status IS 'availability status: available or checked_out';
COMMENT ON COLUMN public.books.borrower_id IS 'current borrower, null when available';

-- ============================================================
-- Borrow history ledger
-- ============================================================
CREATE TABLE IF NOT EXISTS public.borrow_history (
    id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id       uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    borrower_id   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    borrower_name text,
    borrowed_at   timestamptz DEFAULT now(),
    returned_at   timestamptz
);

COMMENT ON TABLE public.borrow_history IS 'Ledger of all borrow and return transactions.';
COMMENT ON COLUMN public.borrow_history.borrower_name IS 'Snapshot of borrower name at time of transaction.';

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_books_borrower_id ON public.books(borrower_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON public.books(status);
CREATE INDEX IF NOT EXISTS idx_books_title ON public.books(title);
CREATE INDEX IF NOT EXISTS idx_books_author ON public.books(author);
CREATE INDEX IF NOT EXISTS idx_borrow_history_book_id ON public.borrow_history(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_history_borrower_id ON public.borrow_history(borrower_id);

-- ============================================================
-- Triggers
-- ============================================================
-- Auto-update updated_at on books
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_books_updated_at ON public.books;
CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auth_users_insert ON auth.users;
CREATE TRIGGER trg_auth_users_insert
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.borrow_history ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- Profiles policies
-- --------------------------------------------------------
CREATE POLICY "Allow public select on profiles"
    ON public.profiles
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- --------------------------------------------------------
-- Books policies
-- --------------------------------------------------------
CREATE POLICY "Allow public select on books"
    ON public.books
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on books"
    ON public.books
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on books"
    ON public.books
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- --------------------------------------------------------
-- Borrow history policies
-- --------------------------------------------------------
CREATE POLICY "Allow public select on borrow_history"
    ON public.borrow_history
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow authenticated insert on borrow_history"
    ON public.borrow_history
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Allow authenticated update on borrow_history"
    ON public.borrow_history
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
