'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const router = useRouter();

  const handleEnterLibrary = () => {
    setIsVisible(false);
    setTimeout(() => {
      router.push('/');
    }, 800);
  };

  if (!isVisible) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/5 rounded-full blur-[80px] animate-float"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />
        <div 
          className="absolute bottom-[10%] right-[5%] w-72 h-72 bg-secondary/5 rounded-full blur-[100px] animate-float-delayed"
          style={{ animation: 'float 6s ease-in-out 3s infinite' }}
        />
      </div>

      {/* Main Splash Content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        {/* Logo Section */}
        <div 
          className="mb-12 flex flex-col items-center animate-fade-in"
          style={{ animation: 'fadeInUp 1.2s ease-out forwards' }}
        >
          <div className="relative group">
            {/* Logo Circle */}
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden shadow-[0px_20px_50px_rgba(82,96,72,0.12)] border-[6px] border-white/50 backdrop-blur-sm transition-transform duration-700 group-hover:scale-105">
              <img
                alt="Amravati Reads Logo"
                className="w-full h-full object-cover"
                style={{ 
                  filter: 'grayscale(0.2) sepia(0.1)',
                  content: 'url(https://lh3.googleusercontent.com/aida/AP1WRLtMPBlkduSmRG49ybxH6G1uTFKn9aJdp-7XUGvTat6v9c5HNmNN_1G5o9TrcOecZ_VBxLi1YI35hYyJ3UOQRmU8icW4nIUJU0oIL6ounNtlpaIStRbIV3_0_7drdl0HERQtwhP0DTQNpbOVos-DJDFys5DBct5x582evRG4BPC6X5tjTs_olKKxNCrKVhpmelLCSTeIsba7rmZqhuPL46l5IlmcqZTFmJag260f9pYuLMfP_xBO2gYVzbhY-qC5Gbh2ObmsvDtxyQ)'
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
        <div 
          className="text-center max-w-md mx-auto space-y-4 px-4"
          style={{ animation: 'fadeInUp 1.2s ease-out 0.4s forwards', opacity: 0 }}
        >
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight">
            Amravati Reads
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed opacity-80 italic">
            “In the hush of the curated shelves, find your sanctuary.”
          </p>
        </div>

        {/* Action Button */}
        <div 
          className="mt-10 flex flex-col items-center gap-6"
          style={{ animation: 'fadeInUp 1.2s ease-out 0.8s forwards', opacity: 0 }}
        >
          <button
            onClick={handleEnterLibrary}
            className="group relative px-10 py-3.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md transition-all duration-300 hover:bg-primary-container hover:shadow-xl active:scale-95 flex items-center gap-2 shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)]"
          >
            <span>Enter Library</span>
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
            <span>Est. 2026</span>
            <span className="h-px w-6 bg-outline/30" />
          </div>
        </div>
      </main>

      {/* Scroll Indicator */}
      <div 
        className="absolute bottom-16 left-1/2 -translate-x-1/2 opacity-40"
        style={{ animation: 'fadeIn 1.2s ease-out 1.2s forwards', opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-[1px] h-10 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </div>

      {/* Footer Identity */}
      <footer 
        className="fixed bottom-0 w-full px-6 py-4 z-20 flex justify-between items-center pointer-events-none"
        style={{ animation: 'fadeIn 1.2s ease-out 1.2s forwards', opacity: 0 }}
      >
        <div className="hidden md:block pointer-events-auto">
          <p className="font-label-sm text-label-sm text-on-surface-variant/40">
            A Literary Sanctuary for Modern Bibliophiles
          </p>
        </div>
        <div className="pointer-events-auto flex gap-5">
          <a 
            className="text-primary/40 hover:text-primary transition-colors flex items-center justify-center" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-symbols-outlined text-xl">menu_book</span>
          </a>
          <a 
            className="text-primary/40 hover:text-primary transition-colors flex items-center justify-center" 
            href="#"
            onClick={(e) => e.preventDefault()}
          >
            <span className="material-symbols-outlined text-xl">local_library</span>
          </a>
        </div>
      </footer>

      {/* Inline Styles for Animations */}
      <style jsx>{`
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

        .animate-fade-in {
          animation: fadeInUp 1.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}