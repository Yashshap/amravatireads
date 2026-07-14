"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Book } from "@/types";
import { getAllBooks, updateBook } from "@/services/books";

export default function Home() {
  const [showSplash, setShowSplash] = useState(() => {
    // Only show splash if user hasn't dismissed it in this session
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('splashDismissed') !== 'true';
    }
    return true;
  });
  // State for data, popup and toast
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [name, setName] = useState("");
  const [toast, setToast] = useState<{ show: boolean; message: string }>({
    show: false,
    message: ""
  });

  // Pagination states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("popular"); // 'popular' | 'rating' | 'title'
  const [currentPage, setCurrentPage] = useState(1);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };


  // Fetch books on component mount
  useEffect(() => {
    async function fetchBooks() {
      try {
        setIsLoading(true);
        const data = await getAllBooks();
        setBooks(data);
      } catch (error) {
        console.error("Failed to fetch books:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBooks();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory, sortBy]);

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
    if (name.trim() && selectedBook) {
      const bookToUpdate = selectedBook;
      const userName = name.trim();
      
      // Close popup & reset inputs early for responsive feel
      setIsPopupOpen(false);
      setName("");
      setSelectedBook(null);

      // Instantly update local UI state (optimistic update)
      setBooks(prev => 
        prev.map(b => 
          b.id === bookToUpdate.id 
            ? { ...b, available: false, borrowedCount: b.borrowedCount + 1 } 
            : b
        )
      );

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

  // Filter books based on search query and category
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "All" ||
      book.category.toLowerCase() === activeCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // Sort books
  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    if (sortBy === "title") {
      return a.title.localeCompare(b.title);
    }
    // popular (borrowedCount)
    return b.borrowedCount - a.borrowedCount;
  });

  // Pagination for user catalog
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(sortedBooks.length / ITEMS_PER_PAGE);
  const paginatedBooks = sortedBooks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-label-md text-on-surface-variant">Loading books...</p>
      </div>
    );
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 bg-background overflow-hidden">
        {/* Atmospheric Background Layers */}
        <div className="fixed inset-0 pointer-events-none z-0">
          {/* Soft Radial Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(216,232,200,0.15),_transparent_70%)]" />
          {/* Grain Texture */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noise)" opacity="0.5"/%3E%3C/svg%3E")',
            }}
          />
          {/* Animated Shapes */}
          <div 
            className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[80px]"
            style={{ animation: 'float 6s ease-in-out infinite' }}
          />
          <div 
            className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-secondary/5 rounded-full blur-[100px]"
            style={{ animation: 'float 6s ease-in-out 3s infinite' }}
          />
        </div>

        {/* Main Splash Content */}
        <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
          {/* Logo Section */}
          <div className="mb-12 flex flex-col items-center">
            <div className="relative">
              {/* Logo Circle */}
              <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-[0px_20px_50px_rgba(82,96,72,0.12)] border-[6px] border-white/50 backdrop-blur-sm">
                <img
                  src="/icon.png"
                  alt="Amravati Reads Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.className = 'w-full h-full bg-primary/10 flex items-center justify-center';
                    fallback.innerHTML = '<span class="material-symbols-outlined text-6xl text-primary">auto_stories</span>';
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              {/* Decorative Ring */}
              <div 
                className="absolute inset-[-10px] border border-primary/10 rounded-full"
                style={{ animation: 'spin 20s linear infinite' }}
              />
            </div>
          </div>

          {/* Typography Content */}
          <div className="text-center max-w-md mx-auto space-y-4 px-4 mb-10">
            <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
              Amravati Reads
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed opacity-80 italic">
              “In the hush of the curated shelves, find your sanctuary.”
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center gap-6">
            <button
              onClick={() => {
                setShowSplash(false);
                sessionStorage.setItem('splashDismissed', 'true');
              }}
              className="group relative px-12 py-4 bg-primary text-on-primary rounded-lg font-label-md text-label-md transition-all duration-300 hover:bg-primary-container hover:shadow-xl active:scale-95 flex items-center gap-2 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
            >
              <span>Explore Library</span>
              <span 
                className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                arrow_right_alt
              </span>
            </button>

            {/* Soft Secondary Hint */}
            <div className="flex items-center gap-4 text-outline font-label-sm text-label-sm uppercase tracking-widest">
              <span className="h-px w-6 bg-outline/30" />
              <span>Est. 2024</span>
              <span className="h-px w-6 bg-outline/30" />
            </div>
          </div>
        </main>

      </div>
    );
  }

  return (
    <div className="max-w-[480px] mx-auto relative min-h-screen pb-20">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-4 pt-6 pb-2 bg-surface sticky top-0 z-10">
        <h2 className="text-headline-md text-primary">Amravati Reads</h2>
        <button className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors focus:outline-none">

        </button>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="relative flex items-center w-full h-12 rounded-full bg-surface-container-high shadow-sm overflow-hidden border border-transparent focus-within:border-primary transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant absolute left-4">search</span>
          <input
            className="w-full h-full pl-12 pr-4 bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-0 border-none"
            placeholder="Search books, authors..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Horizontal Chips */}
      <div className="flex gap-2 px-4 py-2 overflow-x-auto hide-scrollbar snap-x mx-4">
        {['All', 'Self Help', 'Fantasy', 'History', 'Business', 'Fiction', 'Psychology'].map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`snap-start shrink-0 px-4 py-2 rounded-full text-label-md transition-colors cursor-pointer ${
              activeCategory === category
                ? 'bg-primary text-on-primary font-bold'
                : 'bg-surface-container-high text-on-surface hover:bg-surface-variant'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Sort & Load Duration Indicator */}
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-lg border border-outline-variant text-label-md text-on-surface bg-surface-container-lowest focus:outline-none cursor-pointer font-bold"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title A-Z</option>
          </select>
          <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none">expand_more</span>
        </div>

      </div>

      {/* Grid of Book Cards */}
      <main className="px-4 pb-6 flex flex-col gap-6">
        {paginatedBooks.length === 0 ? (
          <div className="text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-dashed border-outline/20">
            <span className="material-symbols-outlined text-4xl mb-2 text-outline">search_off</span>
            <p className="font-body-md">No books found matching your search.</p>
          </div>
        ) : (
          paginatedBooks.map((book) => {
            return (
              <Link href={`/book/${book.id}`} key={book.id} className="block">
                <article className="flex gap-4 p-4 rounded-xl bg-surface-container-lowest shadow-sm border border-surface-variant">
                  <div className="w-24 h-36 shrink-0 rounded-lg overflow-hidden bg-surface-container shadow-inner">
                    <img className="w-full h-full object-cover" alt={book.title} src={book.cover} />
                  </div>
                  <div className="flex flex-col flex-1 justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          book.available 
                            ? 'text-primary bg-primary-fixed-dim bg-opacity-20' 
                            : 'text-tertiary-container bg-tertiary-container bg-opacity-10'
                        }`}>
                          {book.available ? 'Available' : 'Already Dibbed'}
                        </span>
                        <div className="flex items-center gap-1 text-label-sm text-on-surface-variant">
                          <span className="material-symbols-outlined text-[14px] text-tertiary" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          {book.rating}
                        </div>
                      </div>
                      <h3 className="text-lg font-bold text-on-surface leading-tight mb-1" title={book.title}>
                        {truncateText(book.title, 20)}
                      </h3>
                      <p className="text-label-md text-on-surface-variant" title={book.author}>
                        {truncateText(book.author, 20)}
                      </p>
                      {book.synopsis && (
                        <p className="text-sm text-on-surface-variant mt-2 line-clamp-1 text-justify" title={book.synopsis}>
                          {book.synopsis}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[12px] text-on-surface-variant">
                        <span className="">{book.category}</span>
                        <span className="">•</span>
                        <span className="">Borrowed {book.borrowedCount} times</span>
                      </div>
                    </div>
                    <button 
                      className={`mt-3 w-full py-2 rounded-xl text-label-md font-bold flex items-center justify-center gap-2 transition-opacity ${
                        book.available 
                          ? 'bg-primary text-on-primary hover:bg-opacity-90' 
                          : 'bg-surface-container-highest text-on-surface-variant cursor-not-allowed'
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (book.available) {
                          setSelectedBook(book);
                          setIsPopupOpen(true);
                        }
                      }}
                      disabled={!book.available}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {book.available ? 'auto_stories' : 'check'}
                      </span>
                      {book.available ? 'Call Dibs' : 'Dibs Called'}
                    </button>
                  </div>
                </article>
              </Link>
            );
          })
        )}
      </main>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 px-4 py-4 mb-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container hover:bg-surface-container-high text-on-surface disabled:opacity-40 transition-colors cursor-pointer"
            title="Next Page"
          >
            <span className="material-symbols-outlined">navigate_next</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation (Shared Component) */}
      <div className="fixed bottom-0 left-0 right-0 max-w-[480px] mx-auto border-t border-surface-variant bg-surface-container-lowest">

      </div>

      {/* Popup */}
      {isPopupOpen && selectedBook && (
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
                onClick={() => {
                  setIsPopupOpen(false);
                  setName("");
                  setSelectedBook(null);
                }}
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

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
