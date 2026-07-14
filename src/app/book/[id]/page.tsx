"use client";

import Link from "next/link";
import { useState, useEffect, use } from "react";
import { Book } from "@/types";
import { getBookById, updateBook } from "@/services/books";

export default function BookDetails({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  // State for data, popup and toast
  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ""
  });

  // Synopsis expand/collapse state
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);

  // Fetch book data on component mount or param change
  useEffect(() => {
    async function fetchBook() {
      try {
        setIsLoading(true);
        const idNum = Number(id);
        const data = await getBookById(idNum);
        setBook(data || null);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        setBook(null);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBook();
  }, [id]);

  // Get today's date in readable format
  const getTodayDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Handle Call Dibs button click
  const handleCallDibs = async () => {
    if (name.trim() && book) {
      const bookToUpdate = book;
      const userName = name.trim();

      // Close popup & reset input early for responsive feel
      setIsPopupOpen(false);
      setName("");

      // Instantly update local UI state (optimistic update)
      setBook(prev => prev ? { ...prev, available: false, borrowedCount: prev.borrowedCount + 1 } : null);

      try {
        // Persist update to Supabase
        await updateBook(bookToUpdate.id, {
          available: false,
          borrowedCount: bookToUpdate.borrowedCount + 1
        });

        setToast({
          show: true,
          message: `Congratulations ${userName}, ${bookToUpdate.title} is booked for you for ${getTodayDate()} session. Happy Reading.`
        });
      } catch (error) {
        console.error("Failed to update book availability in Supabase:", error);
        // Toast is shown regardless since local state is already updated optimistically
        setToast({
          show: true,
          message: `Congratulations ${userName}, ${bookToUpdate.title} is booked for you for ${getTodayDate()} session. Happy Reading.`
        });
      }
    }
  };

  // Auto-hide toast after 5 seconds
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-label-md text-on-surface-variant">Loading book...</p>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <p className="text-label-md text-on-surface-variant">Book not found</p>
        <Link href="/" className="px-6 py-3 rounded-xl bg-primary text-on-primary text-label-md font-bold">
          Go Back Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 max-w-[480px] mx-auto z-20 bg-background">
        <div className="flex items-center justify-between px-4 pt-6 pb-4">
          <Link href="/" className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
            <span className="material-symbols-outlined text-on-surface">arrow_back</span>
          </Link>
          <div className="flex items-center gap-2">
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-on-surface">favorite_border</span>
            </button>
            <button className="w-12 h-12 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span className="material-symbols-outlined text-on-surface">share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Book Cover Section */}
      <div className="pt-32 pb-8 flex flex-col items-center">
        <div className="w-48 h-72 rounded-xl overflow-hidden shadow-xl mb-6">
          <img 
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h1 className="text-headline-lg-mobile text-on-surface text-center mb-2">{book.title}</h1>
        <p className="text-label-md text-on-surface-variant mb-6">{book.author}</p>
        
        {/* Stats */}
        <div className="flex items-center gap-8 mb-6">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
            <span className="text-label-md text-on-surface font-bold">{book.rating}</span>
            <span className="text-label-sm text-on-surface-variant">(2.5k)</span>
          </div>
          {book.pages && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">menu_book</span>
              <span className="text-label-md text-on-surface">{book.pages} pages</span>
            </div>
          )}
          {book.year && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">event</span>
              <span className="text-label-md text-on-surface">{book.year}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-6">
        {/* Synopsis */}
        {book.synopsis && (
          <div className="mb-8">
            <h2 className="text-headline-md text-on-surface mb-4">Synopsis</h2>
            <div className={`text-body-md text-on-surface-variant leading-relaxed text-justify ${!showFullSynopsis ? 'line-clamp-[15]' : ''}`}>
              {book.synopsis}
            </div>
            {book.synopsis.length > 100 && (
              <button
                onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                className="text-primary font-medium mt-2 hover:underline"
              >
                {showFullSynopsis ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-surface-container-low">
            <p className="text-label-sm text-on-surface-variant mb-1">Category</p>
            <p className="text-label-md text-on-surface font-medium">{book.category}</p>
          </div>
          {book.language && (
            <div className="p-4 rounded-xl bg-surface-container-low">
              <p className="text-label-sm text-on-surface-variant mb-1">Language</p>
              <p className="text-label-md text-on-surface font-medium">{book.language}</p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="p-4 rounded-xl bg-surface-container-low mb-8 flex items-center justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">Availability</p>
            <p className={`text-label-md font-bold ${book.available ? 'text-primary' : 'text-tertiary-container'}`}>
              {book.available ? 'Available' : 'Already Dibbed'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
            <span className="material-symbols-outlined text-[18px]">people</span>
            <span>Borrowed {book.borrowedCount} times</span>
          </div>
        </div>

        {/* Bottom Action Button */}
        <div className="p-4 -mx-4 -mb-6">
          <button 
            className={`w-full py-4 rounded-xl text-label-md font-bold flex items-center justify-center gap-2 transition-opacity ${
              book.available 
                ? 'bg-primary text-on-primary hover:bg-opacity-90' 
                : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
            }`}
            onClick={() => book.available && setIsPopupOpen(true)}
            disabled={!book.available}
          >
            <span className="material-symbols-outlined text-[24px]">
              {book.available ? 'auto_stories' : 'check'}
            </span>
            {book.available ? 'Call Dibs' : 'Dibs Called'}
          </button>
        </div>
      </div>

      {/* Popup */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-end justify-center">
          <div className="w-full max-w-[480px] bg-surface-container-lowest rounded-t-2xl p-6 animate-slide-up">
            <h2 className="text-headline-md text-on-surface mb-4">Enter Your Name</h2>
            <div className="mb-6">
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-surface-variant text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary"
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 rounded-xl bg-surface-container-high text-on-surface text-label-md font-medium hover:bg-opacity-80"
                onClick={() => setIsPopupOpen(false)}
              >
                Go Back
              </button>
              <button 
                className="flex-1 py-3 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-opacity-90"
                onClick={handleCallDibs}
                disabled={!name.trim()}
              >
                Call Dibs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-20 left-0 right-0 max-w-[480px] mx-auto z-40 px-4 animate-slide-up">
          <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <span className="material-symbols-outlined text-[24px]">check_circle</span>
            <p className="text-label-md">{toast.message}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
