'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addBook(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const cover_url = formData.get('cover_url') as string

  if (!title || !author) {
    return { success: false, error: 'Title and author are required' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('books').insert({
    title,
    author,
    cover_url: cover_url || null,
    added_by_user_id: user.id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function checkoutBook(bookId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.rpc('checkout_book', { book_id: bookId })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function returnBook(bookId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('books')
    .update({ status: 'available', borrower_id: null })
    .eq('id', bookId)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
