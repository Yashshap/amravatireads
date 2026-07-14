'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminAuth() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (authError) {
        setError(authError.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center p-8 md:p-16 relative w-full min-h-screen overflow-y-auto bg-background">
      {/* Background + Shadow Container */}
      <div className="flex flex-col items-start p-8 md:p-12 gap-8 isolate relative w-full max-w-[448px] bg-surface-container-lowest shadow-[0px_10px_30px_rgba(92,64,51,0.06)] rounded-xl">
        
        {/* Decorative Background Element */}
        <div className="absolute w-32 h-32 -right-16 -top-16 bg-primary-fixed opacity-20 blur-[20px] rounded-full z-0" />
        
        {/* Header Section */}
        <div className="flex flex-col items-center p-0 w-full z-1 gap-0">
          {/* Logo Container */}
          <div className="flex flex-col items-start pb-6 w-24">
            {/* Logo Placeholder */}
            <div className="w-24 h-24 bg-surface-container shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary">menu_book</span>
            </div>
          </div>
          
          {/* Heading 1 Container */}
          <div className="flex flex-col items-start pb-2 w-full">
            <div className="flex flex-col items-center p-0 w-full">
              <h1 className="font-display-lg text-headline-lg text-on-surface text-center font-bold">
                Amravati Reads
              </h1>
            </div>
          </div>
          
          {/* Subtitle Container */}
          <div className="flex flex-col items-center px-5 py-0 w-full">
            <p className="font-body-md text-body-md text-center text-on-surface-variant">
              Welcome back! Please sign in to continue.
            </p>
          </div>
        </div>
        
        {/* Login Form */}
        <form onSubmit={handleSignIn} className="flex flex-col items-start pt-2 gap-5 w-full z-2">
          {error && (
            <div className="w-full p-3 text-sm bg-error/10 border border-error/20 text-error rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0 text-error">error</span>
              <p className="font-medium leading-normal">{error}</p>
            </div>
          )}

          <div className="flex flex-col items-end p-0 gap-[6px] w-full">
            {/* Email Label */}
            <div className="flex flex-col items-start p-0 w-full">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Email
              </span>
            </div>
            
            {/* Email Input */}
            <div className="relative flex flex-col items-start p-0 w-full h-12">
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={loading}
                className="w-full h-full px-4 pl-11 py-[13px] bg-surface-container rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <div className="absolute left-[14px] top-[30%] bottom-[30%] flex items-center opacity-60">
                <span className="material-symbols-outlined text-on-surface-variant">mail</span>
              </div>
            </div>
            
            {/* Password Label */}
            <div className="flex flex-col items-start pt-[10px] p-0 w-full">
              <span className="font-label-md text-label-md text-on-surface-variant">
                Password
              </span>
            </div>
            
            {/* Password Input */}
            <div className="relative flex flex-col items-start p-0 w-full h-12">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full h-full px-4 pl-11 pr-12 py-[13px] bg-surface-container rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant placeholder:opacity-50 focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              />
              <div className="absolute left-[14px] top-[30%] bottom-[30%] flex items-center opacity-60">
                <span className="material-symbols-outlined text-on-surface-variant">lock</span>
              </div>
              <div className="absolute right-[14px] top-[30%] bottom-[30%] flex items-center opacity-60 cursor-pointer">
                <span 
                  className="material-symbols-outlined text-on-surface-variant"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sign In Button */}
          <button 
            type="submit"
            disabled={loading}
            className="flex flex-row items-center justify-center py-[14px] px-4 gap-2 w-full h-12 bg-primary shadow-[0px_1px_2px_rgba(0,0,0,0.05)] rounded-lg disabled:opacity-60 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="material-symbols-outlined text-on-primary text-base">
              {loading ? "sync" : "login"}
            </span>
            <span className="font-label-md text-label-md text-on-primary">
              {loading ? "Signing In..." : "Sign In"}
            </span>
          </button>
        </form>
        
      </div>
    </div>
  );
}
