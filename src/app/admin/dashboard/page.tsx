'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Book } from '@/types';
import { getAllBooks, createBook, updateBook, deleteBook } from '@/services/books';
import { uploadBookCover, deleteBookCover } from '@/services/storage';
import { supabase } from '@/lib/supabase';

const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Sci-Fi',
  'Self Help',
  'Business',
  'Fantasy',
  'Biography',
  'Mystery'
];

const LANGUAGES = [
  'English',
  'Hindi',
  'Marathi',
  'Spanish',
  'French'
];

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  // Synopsis expand/collapse state
  const [expandedSynopsis, setExpandedSynopsis] = useState<number | null>(null);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  // Reset page to 1 when search query or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilter]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Form states for adding a book
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState('');
  const [category, setCategory] = useState('');
  const [language, setLanguage] = useState('English');
  const [rating, setRating] = useState('4.5');
  const [copies, setCopies] = useState(1);
  const [synopsis, setSynopsis] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states for editing a book
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditBook, setSelectedEditBook] = useState<Book | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAuthor, setEditAuthor] = useState('');
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null);
  const [editCoverPreview, setEditCoverPreview] = useState<string>('');
  const [editCoverUrl, setEditCoverUrl] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLanguage, setEditLanguage] = useState('English');
  const [editRating, setEditRating] = useState('4.5');
  const [editSynopsis, setEditSynopsis] = useState('');
  const [editAvailable, setEditAvailable] = useState(true);
  const [editBorrowedCount, setEditBorrowedCount] = useState(0);

  // Toast notification state
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ''
  });

  // Delete confirmation state
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Three dots menu active state
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setCoverFile(null);
    setCoverPreview('');
    setCoverUrl('');
    setCategory('');
    setLanguage('English');
    setRating('4.5');
    setCopies(1);
    setSynopsis('');
    setErrorMsg(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    resetForm();
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (book: Book) => {
    setSelectedEditBook(book);
    setEditTitle(book.title);
    setEditAuthor(book.author);
    setEditCoverFile(null);
    setEditCoverPreview('');
    setEditCoverUrl(book.cover || '');
    setEditCategory(book.category);
    setEditLanguage(book.language || 'English');
    setEditRating(book.rating.toString());
    setEditSynopsis(book.synopsis || '');
    setEditAvailable(book.available);
    setEditBorrowedCount(book.borrowedCount);
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setSelectedEditBook(null);
    setIsEditModalOpen(false);
    setErrorMsg(null);
  };

  useEffect(() => {
    async function fetchBooks() {
      try {
        const data = await getAllBooks();
        setBooks(data);
      } catch (error) {
        console.error('Error fetching books:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Guarantee that form fields are completely reset whenever the modal opens or closes
  useEffect(() => {
    resetForm();
  }, [isModalOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const previewUrl = URL.createObjectURL(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setEditCoverFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditCoverPreview(previewUrl);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim() || !category) {
      setErrorMsg('Book Title, Author, and Genre are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);
      let uploadError = null;

      // Determine cover source (Optional - fallback to placeholder)
      let finalCover = '';
      if (coverUrl.trim()) {
        finalCover = coverUrl.trim();
        console.log('Using cover URL:', finalCover);
      } else if (coverFile) {
        console.log('Uploading cover file:', coverFile.name);
      } else {
        // Fallback placeholder cover
        finalCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop';
      }

      const parsedRating = parseFloat(rating) || 0;

      // If we have a file to upload, create book first, then upload cover
      if (coverFile) {
        try {
          // Create book first to get an ID
          const newBook = {
            title: title.trim(),
            author: author.trim(),
            cover: '',
            rating: parsedRating,
            pages: 200,
            year: new Date().getFullYear(),
            category: category,
            language: language,
            borrowedCount: 0,
            available: true,
            synopsis: synopsis.trim() || 'No description available.',
          };
          
          console.log('Creating book in database...');
          const createdBook = await createBook(newBook);
          if (!createdBook) {
            throw new Error('Failed to create book');
          }
          console.log('Book created with ID:', createdBook.id);

          // Upload cover image
          console.log('Uploading cover to Supabase Storage...');
          finalCover = await uploadBookCover(coverFile, createdBook.id);
          console.log('Cover uploaded successfully:', finalCover);

          // Update book with cover URL
          console.log('Updating book with cover URL...');
          await updateBook(createdBook.id, { cover: finalCover });
          console.log('Book updated successfully');
        } catch (uploadErr) {
          console.error('Error uploading cover:', uploadErr);
          uploadError = uploadErr instanceof Error ? uploadErr.message : 'Unknown error';
          // Fallback to placeholder if upload fails
          finalCover = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop';
        }
      } else {
        // No file to upload, create book directly with cover URL
        const bookToCreate = {
          title: title.trim(),
          author: author.trim(),
          cover: finalCover,
          rating: parsedRating,
          pages: 200,
          year: new Date().getFullYear(),
          category: category,
          language: language,
          borrowedCount: 0,
          available: true,
          synopsis: synopsis.trim() || 'No description available.',
        };

        const result = await createBook(bookToCreate);
        if (!result) {
          setErrorMsg('Failed to add the book to Supabase database.');
          return;
        }
      }

      // Refresh catalog list
      console.log('Refreshing book catalog...');
      const updatedBooks = await getAllBooks();
      setBooks(updatedBooks);
      console.log('Catalog refreshed, total books:', updatedBooks.length);

      // Reset states
      setTitle('');
      setAuthor('');
      setCoverFile(null);
      setCoverPreview('');
      setCoverUrl('');
      setCategory('');
      setLanguage('English');
      setRating('4.5');
      setCopies(1);
      setSynopsis('');
      
      // Show success/error message
      if (uploadError) {
        setErrorMsg(`Book added successfully, but cover upload failed: ${uploadError}`);
        setToast({ show: true, message: 'Book added, but cover upload failed' });
        // Don't close modal if there's an error, so user can see the error message
      } else {
        // Close modal only on success
        setIsModalOpen(false);
        setToast({ show: true, message: 'Book added successfully!' });
      }
    } catch (err: unknown) {
      console.error('Error adding book:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditBook) return;
    if (!editTitle.trim() || !editAuthor.trim() || !editCategory) {
      setErrorMsg('Book Title, Author, and Genre are required fields.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      let finalCover = selectedEditBook.cover;
      
      // If a new file is uploaded, upload it to Supabase Storage
      if (editCoverFile) {
        try {
          // Delete old cover if it exists and is from our storage
          if (selectedEditBook.cover && selectedEditBook.cover.includes('book-covers')) {
            await deleteBookCover(selectedEditBook.cover);
          }
          // Upload new cover
          finalCover = await uploadBookCover(editCoverFile, selectedEditBook.id);
        } catch (uploadErr) {
          console.error('Error uploading new cover:', uploadErr);
          // Keep existing cover if upload fails
          finalCover = selectedEditBook.cover;
        }
      } else if (editCoverUrl.trim()) {
        finalCover = editCoverUrl.trim();
      }

      const parsedRating = parseFloat(editRating) || 0;

      const updatedFields: Partial<Book> = {
        title: editTitle.trim(),
        author: editAuthor.trim(),
        cover: finalCover,
        rating: parsedRating,
        category: editCategory,
        language: editLanguage,
        synopsis: editSynopsis.trim(),
        available: editAvailable,
        borrowedCount: editBorrowedCount,
      };

      const result = await updateBook(selectedEditBook.id, updatedFields);
      if (result) {
        // Refresh catalog list
        const updatedBooks = await getAllBooks();
        setBooks(updatedBooks);
        setIsEditModalOpen(false);
        setSelectedEditBook(null);
      } else {
        setErrorMsg('Failed to update the book in Supabase database.');
      }
    } catch (err: unknown) {
      console.error('Error updating book:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    try {
      setSubmitting(true);
      setErrorMsg(null);
      
      // Get book to delete its cover from storage
      const bookToDelete = books.find(b => b.id === bookId);
      if (bookToDelete?.cover && bookToDelete.cover.includes('book-covers')) {
        await deleteBookCover(bookToDelete.cover);
      }
      
      const success = await deleteBook(bookId);
      if (success) {
        setBooks((prev) => prev.filter((b) => b.id !== bookId));
        setBookToDelete(null);
        setIsEditModalOpen(false);
      } else {
        setErrorMsg('Failed to delete the book from Supabase database.');
      }
    } catch (err: unknown) {
      console.error('Error deleting book:', err);
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      activeFilter === 'All' ||
      activeFilter === 'More Filters' ||
      book.category.toLowerCase() === activeFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  // Pagination for admin catalog
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = filteredBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col items-start p-0 relative w-full min-h-screen bg-background">
      {/* Container */}
      <div className="flex flex-row items-start p-0 w-full min-h-screen">
        {/* Sidebar */}
        <aside className="flex flex-col items-start p-6 gap-8 w-[230px] h-screen sticky top-0 overflow-y-auto bg-surface-container-low border-r border-outline/30">
          {/* Logo */}
          <div className="flex flex-col items-start p-0 pb-4 w-full">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-6">
              <div className="w-[22px] h-[19.5px]">
                <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
              </div>
              <div className="flex flex-col items-start p-0">
                <span className="font-display text-[16px] leading-6 text-primary font-normal">Amravati Reads</span>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex flex-col items-start p-0 gap-2 w-full">
            <Link href="/admin/dashboard" className="flex flex-row items-center p-3 gap-3 w-full rounded-xl bg-primary-container">
              <span className="material-symbols-outlined text-on-primary-container text-xl">dashboard</span>
              <span className="font-body text-[16px] leading-6 text-on-primary-container">Dashboard</span>
            </Link>
            <Link href="/admin/dibs" className="flex flex-row items-center p-3 gap-3 w-full rounded-xl hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">checklist_rtl</span>
              <span className="font-body text-[16px] leading-6 text-on-surface-variant">Dibs</span>
            </Link>
            <button onClick={handleLogout} className="flex flex-row items-center p-3 gap-3 w-full rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer">
              <span className="material-symbols-outlined text-on-surface-variant text-xl">logout</span>
              <span className="font-body text-[16px] leading-6 text-on-surface-variant">Logout</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col items-start p-8 gap-8 w-full h-full flex-1">
          {/* Page Header & Controls */}
          <div className="flex flex-row justify-between items-end p-0 gap-8 w-full">
            <div className="flex flex-col items-start p-0 gap-2 w-full">
              <div className="flex flex-col items-start p-0">
                <h1 className="font-display-lg text-[48px] leading-[56px] tracking-[-0.96px] text-on-surface font-bold">Catalog</h1>
              </div>
              <div className="flex flex-col items-start p-0 w-full">
              <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant">
                Manage your collection of books, add new titles, and keep track of inventory.
              </p>
              </div>
            </div>
            <button onClick={handleOpenModal} className="flex flex-row justify-center items-center p-3 gap-2 bg-primary rounded-lg shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] whitespace-nowrap">
              <span className="material-symbols-outlined text-on-primary text-[20px]">add</span>
              <span className="font-label-md text-label-md text-on-primary">Add Book</span>
            </button>
          </div>

          {/* Filters & Search Bar */}
          <div className="flex flex-row justify-center items-center p-2 gap-4 w-full">
            {/* Search Input */}
            <div className="flex flex-col items-start p-0 relative w-full max-w-[448px] h-12">
              <div className="flex flex-row justify-center items-start p-[13px_16px_14px_48px] w-full h-12 bg-[#F0EEE9] rounded-full">
                <input
                  type="text"
                  placeholder="Search by title, author, or ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-[21px] bg-transparent text-body text-[16px] leading-[21px] text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none border-none"
                />
              </div>
              <div className="flex flex-col items-start p-0 absolute w-[18px] left-4 top-1/4 bottom-1/4">
                <span className="material-symbols-outlined text-on-surface-variant text-xl">search</span>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-row items-center gap-2 overflow-x-auto hide-scrollbar w-full">
              {['All', 'Fiction', 'Non-Fiction', 'Sci-Fi', 'Self Help'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`flex flex-row items-center justify-center px-4 py-2 rounded-full text-label-sm text-label-sm font-bold transition-all ${
                    activeFilter === filter
                      ? 'bg-primary-container text-on-primary-container'
                      : 'bg-surface-container-high border border-outline text-on-surface'
                  } ${filter === 'More Filters' ? 'gap-1' : ''}`}
                >
                  {filter === 'More Filters' ? (
                    <>
                      <span className="material-symbols-outlined text-on-surface text-sm">expand_more</span>
                      {filter}
                    </>
                  ) : (
                    filter
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
            {loading ? (
              <p className="col-span-full text-center text-on-surface-variant py-12">Loading books...</p>
            ) : (
              <>
                {paginatedBooks.length === 0 ? (
                  <p className="col-span-full text-center text-on-surface-variant py-12">No books found matching your criteria.</p>
                ) : (
                  paginatedBooks.map((book) => (
                    <article
                      key={book.id}
                      className="relative box-border flex flex-col items-start p-4 gap-4 bg-surface-container-lowest border border-surface-container-low shadow-[0px_10px_30px_rgba(92,64,51,0.06)] rounded-xl w-full justify-between"
                    >
                      {/* Three Dots Menu Button in Top-Right Corner */}
                      <div className="absolute top-6 right-6 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === book.id ? null : book.id);
                          }}
                          className="flex items-center justify-center w-8 h-8 rounded-full bg-white/90 hover:bg-white text-on-surface shadow-sm border border-outline/10 hover:text-primary transition-colors cursor-pointer animate-fade-in"
                          title="Options"
                        >
                          <span className="material-symbols-outlined text-xl font-bold">more_vert</span>
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openMenuId === book.id && (
                          <>
                            {/* Overlay to catch clicks and close the menu */}
                            <div 
                              className="fixed inset-0 z-30" 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(null);
                              }}
                            />
                            <div className="absolute right-0 mt-1 w-36 bg-background border border-outline/15 rounded-lg shadow-lg py-1 z-40 animate-fade-in">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleOpenEditModal(book);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors text-left cursor-pointer font-medium"
                              >
                                <span className="material-symbols-outlined text-lg">edit</span>
                                Edit Book
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  setBookToDelete(book);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-error/10 transition-colors text-left cursor-pointer font-medium"
                              >
                                <span className="material-symbols-outlined text-lg">delete</span>
                                Delete Book
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="flex flex-col items-start gap-4 w-full">
                        {/* Book Cover */}
                        <div className="flex flex-col justify-center items-start p-0 relative w-full aspect-[2/3] bg-surface-variant shadow-inner rounded-lg overflow-hidden">
                          {book.cover ? (
                            <img
                              src={book.cover}
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-symbols-outlined text-on-surface-variant text-6xl">auto_stories</span>
                            </div>
                          )}
                          {/* Availability Badge */}
                          <div className="absolute bottom-2 left-2 flex flex-row items-center p-1.5 gap-1 bg-white/90 border border-outline/30 backdrop-blur-md rounded">
                            <div className={`w-2 h-2 rounded-full ${book.available ? 'bg-primary' : 'bg-tertiary'}`} />
                            <span className={`font-label-sm text-label-sm font-bold ${book.available ? 'text-primary' : 'text-tertiary'}`}>
                              {book.available ? 'Available' : 'Checked Out'}
                            </span>
                          </div>
                        </div>

                        {/* Book Info */}
                        <div className="flex flex-col items-start p-0 gap-1 w-full pr-8">
                          <span className="font-label-sm text-label-sm font-bold text-secondary w-full">{book.category}</span>
                          <h3 className="font-display text-[24px] leading-[30px] text-on-surface font-bold w-full line-clamp-2" title={book.title}>
                            {book.title}
                          </h3>
                          <span className="font-body text-[16px] leading-6 text-on-surface-variant w-full line-clamp-1">
                            {book.author}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </>
            )}
          </div>

          {/* Pagination Controls - Fixed at bottom */}
          {!loading && totalPages > 1 && (
            <div className="fixed bottom-0 left-[230px] right-0 bg-background py-6 z-10">
              <div className="flex justify-center items-center gap-4 w-full">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-40 transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <span className="material-symbols-outlined">navigate_before</span>
                </button>
                <span className="font-label-md text-on-surface-variant font-semibold">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-40 transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <span className="material-symbols-outlined">navigate_next</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddBook} className="bg-background rounded-2xl shadow-xl max-w-[1280px] w-full max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <header className="flex flex-row justify-between items-center p-4 px-16 sticky top-0 z-10 bg-background border-b border-surface-container-high shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex flex-row items-center p-0 gap-4">
                <button type="button" onClick={handleCloseModal} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
                <h1 className="font-display-lg text-[32px] leading-[40px] text-on-surface font-bold">Add New Book</h1>
              </div>
              <div className="flex flex-row items-center p-0 gap-3">
                <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-lg border border-secondary text-secondary font-label-md text-label-md text-center hover:bg-surface-container transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md text-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Add Book'}
                </button>
              </div>
            </header>

            {/* Modal Body */}
            <div className="p-12">
              <div className="flex flex-col items-start p-0 gap-10 max-w-[896px] w-full mx-auto">
                {/* Error message */}
                {errorMsg && (
                  <div className="w-full p-4 bg-tertiary-container text-on-tertiary-container rounded-lg font-body text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                 {/* Cover Upload & Title/Author */}
                <div className="flex flex-row items-start p-0 gap-8 w-full">
                  {/* Cover Upload Area */}
                  <div className="flex flex-col items-start p-0">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {coverUrl.trim() || coverPreview ? (
                        <div className="box-border flex flex-col justify-center items-center relative w-[298.67px] aspect-[2/3] bg-surface-container shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden group">
                          <img
                            src={coverUrl.trim() || coverPreview}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">edit</span>
                          </div>
                        </div>
                      ) : (
                        <div className="box-border flex flex-col justify-center items-center p-24 w-[298.67px] aspect-[2/3] bg-surface-container border-2 border-dashed border-outline shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">upload</span>
                          <span className="font-label-md text-label-md text-on-surface text-center font-bold">Upload Cover File</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant text-center opacity-70">(Optional)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Title & Author */}
                  <div className="flex flex-col items-start p-0 gap-6 flex-1">
                    {/* Title Input */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Book Title *</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. The Secret History"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-display text-[24px] leading-[30px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>

                    {/* Author Input */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Author *</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Donna Tartt"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-body text-[18px] leading-[23px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>

                    {/* Cover URL Input (Optional) */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Cover Image URL (Optional)</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://example.com/cover.jpg"
                        value={coverUrl}
                        onChange={(e) => setCoverUrl(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-body text-[16px] leading-[21px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="w-full p-4 py-4">
                  <div className="w-full border-t-2 border-surface-container-high" />
                </div>

                {/* Metadata Section */}
                <div className="w-full relative h-[188px]">
                  {/* Genre */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-0 right-1/2 top-0 w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Genre *</span>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2 px-3 w-full relative font-body text-[16px]">
                      <select
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none appearance-none cursor-pointer pr-8"
                      >
                        <option value="" disabled>Select a genre...</option>
                        {GENRES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-1/2 right-0 top-0 w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Language</span>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2 px-3 w-full relative font-body text-[16px]">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none appearance-none cursor-pointer pr-8"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Goodreads Rating */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-0 right-1/2 top-[106px] w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Goodreads Rating (Optional)</span>
                    </div>
                    <div className="flex flex-row items-center p-2 px-3 w-full">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm mr-1">star</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="e.g. 4.5"
                        value={rating}
                        onChange={(e) => setRating(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Number of Copies */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-1/2 right-0 top-[106px] w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Number of Copies</span>
                    </div>
                    <div className="flex flex-row items-center p-2 px-3 w-full">
                      <input
                        type="number"
                        min="1"
                        value={copies}
                        onChange={(e) => setCopies(parseInt(e.target.value) || 1)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="box-border flex flex-col items-start p-1 w-full min-h-[200px] bg-[#F0EEE9] rounded-lg">
                  <div className="flex flex-col items-start p-2 pt-2 px-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Synopsis / Description (Optional)</span>
                  </div>
                  <div className="flex flex-col items-start p-1 pt-1 w-full">
                    <textarea
                      placeholder="Write a brief description of the book..."
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      className="w-full p-3 pt-0 bg-transparent font-body text-[16px] leading-6 text-on-surface placeholder:text-outline focus:outline-none border-none min-h-[162px] overflow-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit Book Modal */}
      {isEditModalOpen && selectedEditBook && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <form onSubmit={handleEditBook} className="bg-background rounded-2xl shadow-xl max-w-[1280px] w-full max-h-[90vh] overflow-y-auto relative">
            {/* Modal Header */}
            <header className="flex flex-row justify-between items-center p-4 px-16 sticky top-0 z-10 bg-background border-b border-surface-container-high shadow-[0px_1px_2px_rgba(0,0,0,0.05)]">
              <div className="flex flex-row items-center p-0 gap-4">
                <button type="button" onClick={handleCloseEditModal} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
                <h1 className="font-display-lg text-[32px] leading-[40px] text-on-surface font-bold">Edit Book</h1>
              </div>
              <div className="flex flex-row items-center p-0 gap-3">
                <button type="button" onClick={() => setBookToDelete(selectedEditBook)} className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error hover:text-on-error text-error font-label-md text-label-md text-center transition-colors flex items-center gap-1.5 cursor-pointer">
                  <span className="material-symbols-outlined text-sm">delete</span>
                  Delete Book
                </button>
                <button type="button" onClick={handleCloseEditModal} className="px-4 py-2 rounded-lg border border-secondary text-secondary font-label-md text-label-md text-center hover:bg-surface-container transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md text-center shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1),0px_2px_4px_-2px_rgba(0,0,0,0.1)] disabled:opacity-50 cursor-pointer">
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </header>

            {/* Modal Body */}
            <div className="p-12">
              <div className="flex flex-col items-start p-0 gap-10 max-w-[896px] w-full mx-auto">
                {/* Error message */}
                {errorMsg && (
                  <div className="w-full p-4 bg-tertiary-container text-on-tertiary-container rounded-lg font-body text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">error</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                 {/* Cover Upload & Title/Author */}
                <div className="flex flex-row items-start p-0 gap-8 w-full">
                  {/* Cover Upload Area */}
                  <div className="flex flex-col items-start p-0">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                      {editCoverUrl.trim() || editCoverPreview ? (
                        <div className="box-border flex flex-col justify-center items-center relative w-[298.67px] aspect-[2/3] bg-surface-container shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl overflow-hidden group">
                          <img
                            src={editCoverUrl.trim() || editCoverPreview}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1000&auto=format&fit=crop';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="material-symbols-outlined text-white text-3xl">edit</span>
                          </div>
                        </div>
                      ) : (
                        <div className="box-border flex flex-col justify-center items-center p-24 w-[298.67px] aspect-[2/3] bg-surface-container border-2 border-dashed border-outline shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-xl hover:bg-surface-container-high transition-colors">
                          <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-2">upload</span>
                          <span className="font-label-md text-label-md text-on-surface text-center font-bold">Upload Cover File</span>
                          <span className="font-label-sm text-label-sm text-on-surface-variant text-center opacity-70">(Optional)</span>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Title & Author */}
                  <div className="flex flex-col items-start p-0 gap-6 flex-1">
                    {/* Title Input */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Book Title *</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. The Secret History"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-display text-[24px] leading-[30px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>

                    {/* Author Input */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Author *</span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Donna Tartt"
                        value={editAuthor}
                        onChange={(e) => setEditAuthor(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-body text-[18px] leading-[23px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>

                    {/* Cover URL Input (Optional) */}
                    <div className="box-border flex flex-col items-start p-1 gap-2 w-full bg-[#F0EEE9] rounded-lg">
                      <div className="flex flex-col items-start p-2 pt-2 px-3">
                        <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Cover Image URL (Optional)</span>
                      </div>
                      <input
                        type="url"
                        placeholder="https://example.com/cover.jpg"
                        value={editCoverUrl}
                        onChange={(e) => setEditCoverUrl(e.target.value)}
                        className="w-full p-3 pt-0 bg-transparent font-body text-[16px] leading-[21px] text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="w-full p-4 py-4">
                  <div className="w-full border-t-2 border-surface-container-high" />
                </div>

                {/* Metadata Section */}
                <div className="w-full relative h-[188px]">
                  {/* Genre */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-0 right-1/2 top-0 w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Genre *</span>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2 px-3 w-full relative font-body text-[16px]">
                      <select
                        required
                        value={editCategory}
                        onChange={(e) => setEditCategory(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none appearance-none cursor-pointer pr-8"
                      >
                        <option value="" disabled>Select a genre...</option>
                        {GENRES.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Language */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-1/2 right-0 top-0 w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Language</span>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2 px-3 w-full relative font-body text-[16px]">
                      <select
                        value={editLanguage}
                        onChange={(e) => setEditLanguage(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none appearance-none cursor-pointer pr-8"
                      >
                        {LANGUAGES.map((l) => (
                          <option key={l} value={l}>{l}</option>
                        ))}
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>

                  {/* Goodreads Rating */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-0 right-1/2 top-[106px] w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Goodreads Rating (Optional)</span>
                    </div>
                    <div className="flex flex-row items-center p-2 px-3 w-full">
                      <span className="material-symbols-outlined text-on-surface-variant text-sm mr-1">star</span>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="e.g. 4.5"
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface placeholder:text-outline focus:outline-none border-none"
                      />
                    </div>
                  </div>

                  {/* Availability Status */}
                  <div className="box-border flex flex-col items-start p-1 gap-2 absolute left-1/2 right-0 top-[106px] w-[calc(50%-8px)] bg-[#F0EEE9] rounded-lg">
                    <div className="flex flex-col items-start p-2 pt-2 px-3">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Availability Status</span>
                    </div>
                    <div className="flex flex-col justify-center items-start p-2 px-3 w-full relative font-body text-[16px]">
                      <select
                        value={editAvailable ? "true" : "false"}
                        onChange={(e) => setEditAvailable(e.target.value === "true")}
                        className="w-full bg-transparent font-body text-[16px] leading-6 text-on-surface focus:outline-none border-none appearance-none cursor-pointer pr-8"
                      >
                        <option value="true">Available</option>
                        <option value="false">Checked Out</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm pointer-events-none">expand_more</span>
                    </div>
                  </div>
                </div>

                {/* Description Section */}
                <div className="box-border flex flex-col items-start p-1 w-full min-h-[200px] bg-[#F0EEE9] rounded-lg">
                  <div className="flex flex-col items-start p-2 pt-2 px-3">
                    <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">Synopsis / Description (Optional)</span>
                  </div>
                  <div className="flex flex-col items-start p-1 pt-1 w-full">
                    <textarea
                      placeholder="Write a brief description of the book..."
                      value={editSynopsis}
                      onChange={(e) => setEditSynopsis(e.target.value)}
                      className="w-full p-3 pt-0 bg-transparent font-body text-[16px] leading-6 text-on-surface placeholder:text-outline focus:outline-none border-none min-h-[162px] overflow-auto"
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-background rounded-2xl shadow-xl max-w-[448px] w-full p-6 relative flex flex-col gap-6">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 shrink-0 text-error">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-display text-xl font-bold text-on-surface">Delete Book</h3>
                <p className="font-body text-sm text-on-surface-variant leading-normal">
                  Are you sure you want to delete <strong className="text-on-surface">&quot;{bookToDelete.title}&quot;</strong>? This action cannot be undone and will remove the book permanently from the catalog.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 rounded-lg border border-outline text-on-surface font-label-md text-sm hover:bg-surface-container transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBook(bookToDelete.id)}
                disabled={submitting}
                className="px-5 py-2 rounded-lg bg-error text-on-error font-label-md text-sm hover:bg-error/90 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
