import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[Supabase] Failed to initialize real Supabase client:', err);
  }
}

let listeners: Array<(event: string, session: unknown) => void> = [];

const triggerListeners = (event: string, session: unknown) => {
  listeners.forEach((cb) => {
    try {
      cb(event, session);
    } catch (e) {
      console.error('[Supabase Mock Auth] Error calling listener:', e);
    }
  });
};

if (!client) {
  console.warn('[Supabase] Supabase credentials missing or invalid. Using a resilient fallback client.');
  
  // Create a robust mock client that supports chaining and returns empty/error states
  // so that the books service can gracefully fall back to mock data.
  const mockClient = {
    auth: {
      getSession: async () => {
        if (typeof window !== 'undefined') {
          const sessionStr = localStorage.getItem('mock_sb_session');
          if (sessionStr) {
            try {
              return { data: { session: JSON.parse(sessionStr) }, error: null };
            } catch {
              return { data: { session: null }, error: null };
            }
          }
        }
        return { data: { session: null }, error: null };
      },
      signInWithPassword: async ({ email, password }: { email?: string; password?: string }) => {
        if (email === 'admin@read.com' && password === 'admin123') {
          const mockSession = {
            user: { email: 'admin@read.com', id: 'mock-admin-id' },
            access_token: 'mock-token'
          };
          if (typeof window !== 'undefined') {
            localStorage.setItem('mock_sb_session', JSON.stringify(mockSession));
          }
          triggerListeners('SIGNED_IN', mockSession);
          return { data: { session: mockSession, user: mockSession.user }, error: null };
        } else {
          return { data: { session: null, user: null }, error: { message: 'Invalid credentials. Hint: use admin@read.com / admin123' } };
        }
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('mock_sb_session');
        }
        triggerListeners('SIGNED_OUT', null);
        return { error: null };
      },
      onAuthStateChange: (callback: (event: string, session: unknown) => void) => {
        listeners.push(callback);
        if (typeof window !== 'undefined') {
          const sessionStr = localStorage.getItem('mock_sb_session');
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              callback('SIGNED_IN', session);
            } catch {
              callback('INITIAL_SESSION', null);
            }
          } else {
            callback('INITIAL_SESSION', null);
          }
        } else {
          callback('INITIAL_SESSION', null);
        }
        return {
          data: {
            subscription: {
              unsubscribe: () => {
                listeners = listeners.filter((l) => l !== callback);
              }
            }
          }
        };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase credentials missing' } }),
        }),
        single: async () => ({ data: null, error: { message: 'Supabase credentials missing' } }),
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: null, error: { message: 'Supabase credentials missing' } }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: { message: 'Supabase credentials missing' } }),
          }),
        }),
      }),
      delete: () => ({
        eq: async () => ({ error: { message: 'Supabase credentials missing' } }),
      }),
    }),
  };
  client = mockClient;
}

export const supabase = client;
