// Database type (snake_case)
export interface DatabaseBook {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  pages?: number;
  year?: number;
  category: string;
  language?: string;
  borrowed_count: number;
  available: boolean;
  synopsys?: string;
}

// App type (camelCase)
export interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  rating: number;
  pages?: number;
  year?: number;
  category: string;
  language?: string;
  borrowedCount: number;
  available: boolean;
  synopsis?: string;
}

// Mapper function: DatabaseBook -> Book
export function mapDatabaseBookToApp(dbBook: DatabaseBook): Book {
  return {
    id: dbBook.id,
    title: dbBook.title,
    author: dbBook.author,
    cover: dbBook.cover,
    rating: dbBook.rating,
    pages: dbBook.pages,
    year: dbBook.year,
    category: dbBook.category,
    language: dbBook.language,
    borrowedCount: dbBook.borrowed_count,
    available: dbBook.available,
    synopsis: dbBook.synopsys
  };
}

// Mapper function: Book -> DatabaseBook
export function mapAppBookToDatabase(appBook: Omit<Book, 'id'>): Omit<DatabaseBook, 'id'> {
  return {
    title: appBook.title,
    author: appBook.author,
    cover: appBook.cover,
    rating: appBook.rating,
    pages: appBook.pages,
    year: appBook.year,
    category: appBook.category,
    language: appBook.language,
    borrowed_count: appBook.borrowedCount,
    available: appBook.available,
    synopsys: appBook.synopsis
  };
}
