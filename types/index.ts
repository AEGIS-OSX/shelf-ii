export interface Book {
  id: string
  title: string
  author: string
  cover_url: string | null
  status: 'available' | 'checked_out'
  borrower_id: string | null
  added_by_user_id: string
  created_at: string
}

export interface BorrowHistory {
  id: string
  book_id: string
  borrower_id: string
  borrower_name: string
  borrowed_at: string
  returned_at: string | null
}

export interface Profile {
  user_id: string
  display_name: string
}
