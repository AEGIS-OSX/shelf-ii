-- Books table
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  cover_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'checked_out')),
  borrower_id UUID REFERENCES auth.users(id),
  added_by_user_id UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Borrow history ledger
CREATE TABLE borrow_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  borrower_id UUID NOT NULL REFERENCES auth.users(id),
  borrower_name TEXT NOT NULL,
  borrowed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  returned_at TIMESTAMPTZ
);

-- User profiles
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE borrow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Books policies
CREATE POLICY "books_select" ON books FOR SELECT USING (true);
CREATE POLICY "books_insert" ON books FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "books_update" ON books FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "books_delete" ON books FOR DELETE USING (auth.uid() = added_by_user_id);

-- Borrow history policies (read-only)
CREATE POLICY "borrow_history_select" ON borrow_history FOR SELECT USING (true);
CREATE POLICY "borrow_history_insert" ON borrow_history FOR INSERT WITH CHECK (false);
CREATE POLICY "borrow_history_update" ON borrow_history FOR UPDATE USING (false);
CREATE POLICY "borrow_history_delete" ON borrow_history FOR DELETE USING (false);

-- Profiles policies (self-only)
CREATE POLICY "profiles_select_self" ON profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_self" ON profiles FOR UPDATE USING (auth.uid() = user_id);

-- Public profiles view
CREATE VIEW public_profiles AS
SELECT user_id, display_name
FROM profiles;

-- Checkout book function
CREATE OR REPLACE FUNCTION checkout_book(book_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE books
  SET status = 'checked_out', borrower_id = auth.uid()
  WHERE id = book_id AND status = 'available';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Book is not available for checkout';
  END IF;

  INSERT INTO borrow_history (book_id, borrower_id, borrower_name, borrowed_at)
  SELECT book_id, auth.uid(), p.display_name, now()
  FROM profiles p
  WHERE p.user_id = auth.uid();
END;
$$;
