"use client";

import { useState } from "react";
import { addBook, checkoutBook, returnBook } from "@/app/actions";

export interface AddBookInput {
  title: string;
  author: string;
  cover_url?: string;
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export interface UseBookMutationsResult {
  addBook: (input: AddBookInput) => Promise<ActionResult>;
  checkoutBook: (bookId: string) => Promise<ActionResult>;
  returnBook: (bookId: string) => Promise<ActionResult>;
  isLoading: boolean;
}

export function useBookMutations(refetchBooks: () => void): UseBookMutationsResult {
  const [isLoading, setIsLoading] = useState(false);

  const addBookMutation = async (input: AddBookInput): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      const result = await addBook(input);
      if (result?.success) {
        refetchBooks();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const checkoutBookMutation = async (bookId: string): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      const result = await checkoutBook(bookId);
      if (result?.success) {
        refetchBooks();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const returnBookMutation = async (bookId: string): Promise<ActionResult> => {
    setIsLoading(true);
    try {
      const result = await returnBook(bookId);
      if (result?.success) {
        refetchBooks();
      }
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBook: addBookMutation,
    checkoutBook: checkoutBookMutation,
    returnBook: returnBookMutation,
    isLoading,
  };
}
