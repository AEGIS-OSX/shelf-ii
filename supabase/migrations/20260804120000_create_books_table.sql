-- Migration: create books table for check-out/return system
-- Timestamp: 20260804120000

-- Create the books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  borrower_id UUID NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

-- Policy: public SELECT (anon and authenticated can read)
CREATE POLICY "Public books are viewable"
  ON books
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Policy: authenticated INSERT
CREATE POLICY "Authenticated users can insert books"
  ON books
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: authenticated UPDATE
CREATE POLICY "Authenticated users can update books"
  ON books
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
