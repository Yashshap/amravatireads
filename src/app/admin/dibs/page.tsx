'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Book } from '@/types';
import { getAllBooks, updateBook } from '@/services/books';
import { supabase } from '@/lib/supabase';

function ReservationCard({ book, onRelease }: { book: Book; onRelease: (id: number) => Promise<void> }) {
  const [releasing, setReleasing] = useState(false);
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  const handleReleaseClick = async () => {
    setReleasing(true);
    try {
      await onRelease(book.id);
    } catch (err) {
      console.error(err);
    } finally {
      setReleasing(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl p-5 flex flex-row gap-5 shadow-[0px_10px_30px_rgba(92,64,51,0.06)] border border-outline-variant/10 hover:shadow-[0px_15px_40px_rgba(92,64,51,0.09)] transition-all duration-300 transform hover:-translate-y-1 relative overflow-hidden group">
      <div className="w-24 h-36 md:w-28 md:h-40 shrink-0 rounded-lg overflow-hidden bg-surface-container shadow-sm border border-outline-variant/10">
        {book.cover ? (
          <img
            src={book.cover}
            alt={`${book.title} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary/40">
            <span className="material-symbols-outlined text-4xl">book</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow min-w-0">
        <div className="flex justify-between items-start mb-1 gap-2">
          <h3 className="font-headline-md text-headline-md text-on-background leading-tight font-bold" title={book.title}>
            {truncateText(book.title, 20)}
          </h3>
        </div>
        <p className="font-body-md text-on-surface-variant mb-4" title={book.author}>
          {truncateText(book.author, 20)}
        </p>

        <div className="mt-auto space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[14px] text-on-primary-container">
                person
              </span>
            </div>
            <p className="font-label-md text-on-surface truncate">
              Reserved by: <span className="font-bold">Community Member</span>
            </p>
          </div>

          {book.synopsis && (
            <div className="text-sm text-on-surface-variant">
              <div className={`${!showFullSynopsis ? 'line-clamp-[15]' : ''}`}>
                {book.synopsis}
              </div>
              {book.synopsis.length > 100 && (
                <button
                  onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                  className="text-primary font-medium mt-1 hover:underline"
                >
                  {showFullSynopsis ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pt-2 border-t border-outline-variant/10">
            <div className="flex flex-col">
              <span className="text-[10px] text-outline uppercase font-bold tracking-tighter">
                Status
              </span>
              <span className="font-label-sm text-error font-bold flex items-center gap-1 whitespace-nowrap">
                <span className="inline-block w-2 h-2 rounded-full bg-error animate-pulse"></span>
                Reserved (Dibs Called)
              </span>
            </div>
            <button
              onClick={handleReleaseClick}
              disabled={releasing}
              className="px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-on-primary disabled:opacity-50 transition-colors font-label-md whitespace-nowrap"
            >
              {releasing ? 'Releasing...' : 'Mark Available'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function AdminDibs() {
  const [reservedBooks, setReservedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const fetchReservedBooks = async () => {
    setLoading(true);
    try {
      const allBooks = await getAllBooks();
      // Only keep books that have been called dibs or checked out (available === false)
      const reserved = allBooks.filter((b) => !b.available);
      setReservedBooks(reserved);
    } catch (err) {
      console.error('Error fetching reserved books:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservedBooks();
  }, []);

  const handleRelease = async (bookId: number) => {
    try {
      await updateBook(bookId, { available: true });
      setReservedBooks((prev) => prev.filter((b) => b.id !== bookId));
    } catch (err) {
      console.error('Error releasing book:', err);
    }
  };

  // Pagination for dibs/reservations
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(reservedBooks.length / ITEMS_PER_PAGE);
  const paginatedReservedBooks = reservedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [reservedBooks.length, totalPages, currentPage]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  return (
    <div className="flex flex-col items-start p-0 relative w-full min-h-screen bg-background">
      <div className="flex flex-row items-start p-0 w-full min-h-screen">
        {/* Sidebar */}
        <aside className="flex flex-col items-start p-6 gap-8 w-[230px] h-screen sticky top-0 overflow-y-auto bg-surface-container-low border-r border-outline/30">
          <div className="flex flex-col items-start p-0 pb-4 w-full">
            <div className="flex flex-row items-center p-0 gap-2 w-full h-6">
              <div className="w-[22px] h-[19.5px]">
                <span className="material-symbols-outlined text-primary text-2xl">auto_stories</span>
              </div>
              <div className="flex flex-col items-start p-0">
                <span className="font-display text-[16px] leading-6 text-primary font-normal">
                  Amravati Reads
                </span>
              </div>
            </div>
          </div>

          <nav className="flex flex-col items-start p-0 gap-2 w-full">
            <Link
              href="/admin/dashboard"
              className="flex flex-row items-center p-3 gap-3 w-full rounded-xl hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                dashboard
              </span>
              <span className="font-body text-[16px] leading-6 text-on-surface-variant">
                Dashboard
              </span>
            </Link>
            <Link
              href="/admin/dibs"
              className="flex flex-row items-center p-3 gap-3 w-full rounded-xl bg-primary-container"
            >
              <span className="material-symbols-outlined text-on-primary-container text-xl">
                checklist_rtl
              </span>
              <span className="font-body text-[16px] leading-6 text-on-primary-container">
                Dibs
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex flex-row items-center p-3 gap-3 w-full rounded-xl hover:bg-surface-container-high transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">
                logout
              </span>
              <span className="font-body text-[16px] leading-6 text-on-surface-variant">
                Logout
              </span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex flex-col items-start p-8 gap-8 w-full h-full flex-1">
          {/* Page Header & Controls */}
          <div className="flex flex-row justify-between items-end p-0 gap-8 w-full">
            <div className="flex flex-col items-start p-0 gap-2 w-full">
              <div className="flex flex-col items-start p-0">
                <h1 className="font-display-lg text-[48px] leading-[56px] tracking-[-0.96px] text-on-surface font-bold">
                  Active Reservations
                </h1>
              </div>
              <div className="flex flex-col items-start p-0 w-full">
                  <p className="font-body-lg text-[18px] leading-[28px] text-on-surface-variant">
                    Overview of current book holds and status for the community collection.
                  </p>
              </div>
            </div>
            <button
              onClick={fetchReservedBooks}
              className="px-4 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg border border-outline-variant/30 flex items-center gap-2 text-on-surface-variant font-label-sm shrink-0 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">sync</span>
              Refresh
            </button>
          </div>

          {/* Reservations Grid */}
          {loading ? (
            <div className="w-full flex justify-center items-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : reservedBooks.length > 0 ? (
            <>
              <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl animate-fade-in">
                {paginatedReservedBooks.map((book) => (
                  <ReservationCard key={book.id} book={book} onRelease={handleRelease} />
                ))}
              </div>

              {/* Pagination Controls - Fixed at bottom */}
              {totalPages > 1 && (
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
            </>
          ) : (
            <div className="w-full flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline/30 min-h-[300px]">
              <span className="material-symbols-outlined text-outline text-5xl mb-4">book</span>
              <h3 className="font-headline-md text-headline-md text-on-surface font-bold">No Active Reservations</h3>
              <p className="font-body text-on-surface-variant text-center mt-2 max-w-sm">
                All books are currently on the shelves. No community members have called dibs at the moment.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

