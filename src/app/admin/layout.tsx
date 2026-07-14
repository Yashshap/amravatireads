'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          if (mounted) {
            setIsAuthenticated(true);
            if (pathname === '/admin') {
              router.replace('/admin/dashboard');
            }
          }
        } else {
          if (mounted) {
            setIsAuthenticated(false);
            if (pathname !== '/admin') {
              router.replace('/admin');
            }
          }
        }
      } catch (err) {
        console.error('[AdminLayout] Auth check error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: any) => {
      if (mounted) {
        if (session?.user) {
          setIsAuthenticated(true);
          if (pathname === '/admin') {
            router.replace('/admin/dashboard');
          }
        } else {
          setIsAuthenticated(false);
          if (pathname !== '/admin') {
            router.replace('/admin');
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  // While checking auth status, show a spinner to avoid content flash
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Prevent rendering admin pages if user is not authenticated and is trying to access them
  if (pathname !== '/admin' && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full">
      {children}
    </div>
  );
}
