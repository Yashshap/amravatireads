import { Book, DatabaseBook, mapDatabaseBookToApp, mapAppBookToDatabase } from "@/types";
import { mockBooks } from "@/data/mock-books";
import { supabase } from "@/lib/supabase";

// Get all books
export async function getAllBooks(): Promise<Book[]> {
  try {
    console.log('[getAllBooks] Attempting to fetch from Supabase...');
    const { data, error } = await supabase.from('Books').select('*'); // Changed to "Books" to match your policy
    
    if (error) {
      console.error('[getAllBooks] Error fetching books from Supabase:', error);
      console.log('[getAllBooks] Falling back to mock data');
      return mockBooks; // Fallback to mock data on error
    }
    
    console.log('[getAllBooks] Successfully fetched from Supabase! Data:', data);
    return (data as DatabaseBook[]).map(mapDatabaseBookToApp);
  } catch (err) {
    console.error('[getAllBooks] Unexpected error fetching books:', err);
    console.log('[getAllBooks] Falling back to mock data');
    return mockBooks; // Fallback to mock data
  }
}

// Get a single book by ID
export async function getBookById(id: number): Promise<Book | undefined> {
  try {
    console.log(`[getBookById] Attempting to fetch book with id ${id} from Supabase...`);
    const { data, error } = await supabase.from('Books').select('*').eq('id', id).single(); // Changed to "Books"
    
    if (error) {
      console.error('[getBookById] Error fetching book from Supabase:', error);
      console.log('[getBookById] Falling back to mock data');
      return mockBooks.find(book => book.id === id); // Fallback to mock data
    }
    
    console.log('[getBookById] Successfully fetched from Supabase! Data:', data);
    return mapDatabaseBookToApp(data as DatabaseBook);
  } catch (err) {
    console.error('[getBookById] Unexpected error fetching book:', err);
    console.log('[getBookById] Falling back to mock data');
    return mockBooks.find(book => book.id === id); // Fallback to mock data
  }
}

// Create a book (for CMS)
export async function createBook(book: Omit<Book, 'id'>): Promise<Book | null> {
  try {
    console.log('[createBook] Attempting to create book in Supabase...');
    const dbBook = mapAppBookToDatabase(book);
    const { data, error } = await supabase.from('Books').insert([dbBook]).select().single(); // Changed to "Books"
    
    if (error) {
      console.error('[createBook] Error creating book:', error);
      throw new Error(`Database Error: ${error.message}${error.details ? ' - ' + error.details : ''}`);
    }
    
    console.log('[createBook] Successfully created book!', data);
    return mapDatabaseBookToApp(data as DatabaseBook);
  } catch (err) {
    console.error('[createBook] Unexpected error creating book:', err);
    throw err;
  }
}

// Update a book (for CMS)
export async function updateBook(id: number, updates: Partial<Book>): Promise<Book | null> {
  try {
    console.log(`[updateBook] Attempting to update book with id ${id} in Supabase...`);
    // Convert partial updates to database format
    const dbUpdates: Partial<DatabaseBook> = {};
    if (updates.title) dbUpdates.title = updates.title;
    if (updates.author) dbUpdates.author = updates.author;
    if (updates.cover) dbUpdates.cover = updates.cover;
    if (updates.rating) dbUpdates.rating = updates.rating;
    if (updates.pages !== undefined) dbUpdates.pages = updates.pages;
    if (updates.year !== undefined) dbUpdates.year = updates.year;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.language) dbUpdates.language = updates.language;
    if (updates.borrowedCount !== undefined) dbUpdates.borrowed_count = updates.borrowedCount;
    if (updates.available !== undefined) dbUpdates.available = updates.available;
    if (updates.synopsis) dbUpdates.synopsys = updates.synopsis;
    
    const { data, error } = await supabase.from('Books').update(dbUpdates).eq('id', id).select().single(); // Changed to "Books"
    
    if (error) {
      console.error('[updateBook] Error updating book:', error);
      return null;
    }
    
    console.log('[updateBook] Successfully updated book!', data);
    return mapDatabaseBookToApp(data as DatabaseBook);
  } catch (err) {
    console.error('[updateBook] Unexpected error updating book:', err);
    return null;
  }
}

// Delete a book (for CMS)
export async function deleteBook(id: number): Promise<boolean> {
  try {
    console.log(`[deleteBook] Attempting to delete book with id ${id} in Supabase...`);
    const { error } = await supabase.from('Books').delete().eq('id', id); // Changed to "Books"
    
    if (error) {
      console.error('[deleteBook] Error deleting book:', error);
      return false;
    }
    
    console.log('[deleteBook] Successfully deleted book!');
    return true;
  } catch (err) {
    console.error('[deleteBook] Unexpected error deleting book:', err);
    return false;
  }
}
