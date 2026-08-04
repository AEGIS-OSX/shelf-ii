'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function addBook(formData: FormData) {
  const supabase = createClient()

  const title = formData.get('title') as string
  const author = formData.get('author') as string
  const cover_url = formData.get('cover_url') as string

  if (!title || !author) {
    throw new Error('Title and author are required')
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.from('books').insert({
    title,
    author,
    cover_url: cover_url || null,
    added_by_user_id: user.id,
  })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function checkoutBook(bookId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.rpc('checkout_book', { book_id: bookId })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}

export async function returnBook(bookId: string) {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { error } = await supabase.rpc('return_book', { book_id: bookId })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/dashboard')
}
