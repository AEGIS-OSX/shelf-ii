"use client"

import { useState } from "react"
import { addBook, checkoutBook, returnBook } from "@/app/actions"

interface AddBookInput {
  title: string
  author: string
  cover_url?: string
}

export function useBookMutations(refetchBooks: () => void) {
  const [isLoading, setIsLoading] = useState(false)

  const addBookMutation = async (input: AddBookInput) => {
    setIsLoading(true)
    try {
      await addBook(input)
      refetchBooks()
    } finally {
      setIsLoading(false)
    }
  }

  const checkoutBookMutation = async (bookId: string) => {
    setIsLoading(true)
    try {
      await checkoutBook(bookId)
      refetchBooks()
    } finally {
      setIsLoading(false)
    }
  }

  const returnBookMutation = async (bookId: string) => {
    setIsLoading(true)
    try {
      await returnBook(bookId)
      refetchBooks()
    } finally {
      setIsLoading(false)
    }
  }

  return {
    addBook: addBookMutation,
    checkoutBook: checkoutBookMutation,
    returnBook: returnBookMutation,
    isLoading,
  }
}
