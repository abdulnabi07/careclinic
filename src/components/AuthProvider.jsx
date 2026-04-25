"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { toast } from 'sonner';

const AuthContext = createContext(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Guard: prevents state updates after unmount / cleanup
  const mountedRef = useRef(true);
  // Track whether the initial session check has completed
  const initialised = useRef(false);

  // Fetch role + name from the users table.
  // Falls back to email as name if the row is missing.
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      if (error) throw error;
      return { ...authUser, ...data };
    } catch (err) {
      console.error('[AUTH] fetchProfile error:', err.message);
      // Return the auth user with a fallback role so the dashboard
      // doesn't get stuck; admin can fix the users table separately.
      return { ...authUser, role: 'worker', name: authUser.email };
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    let subscription = null;
    let timeoutId;
    // Local flag to avoid double-resolving the loading state
    let loadingResolved = false;

    const resolveLoading = () => {
      if (!loadingResolved && mountedRef.current) {
        loadingResolved = true;
        initialised.current = true;
        setLoading(false);
        clearTimeout(timeoutId);
      }
    };

    const init = async () => {
      try {
        console.log('[AUTH] Restoring session...');
        const { data: { session }, error } = await supabase.auth.getSession();

        if (!mountedRef.current) return;

        if (error) {
          console.error('[AUTH] getSession error:', error.message);
          setUser(null);
        } else if (session?.user) {
          console.log('[AUTH] Session found for:', session.user.email);
          const profile = await fetchProfile(session.user);
          if (mountedRef.current) setUser(profile);
        } else {
          console.log('[AUTH] No active session.');
          setUser(null);
        }
      } catch (err) {
        console.error('[AUTH] init error:', err);
        if (mountedRef.current) setUser(null);
      } finally {
        resolveLoading();
      }
    };

    // ─── Safety net ────────────────────────────────────────────────
    // If session check hasn't resolved in 3 seconds (e.g. Supabase
    // is unreachable), release the loading gate so the UI isn't stuck.
    timeoutId = setTimeout(() => {
      if (!loadingResolved) {
        console.warn('[AUTH] Session check timed out — releasing loading state.');
        resolveLoading();
      }
    }, 3000);

    // Start the session restore
    init();

    // ─── Auth state listener ───────────────────────────────────────
    // We skip INITIAL_SESSION if init() hasn't finished yet (avoids a
    // race). Once initialised, we DO handle INITIAL_SESSION so that
    // any late-arriving session data still gets picked up.
    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[AUTH] onAuthStateChange:', event, '| session:', !!session);

        // Skip the very first INITIAL_SESSION — we handle that in init()
        if (!initialised.current && event === 'INITIAL_SESSION') {
          return;
        }

        if (!mountedRef.current) return;

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
          case 'USER_UPDATED':
          case 'INITIAL_SESSION': {
            if (session?.user) {
              const profile = await fetchProfile(session.user);
              if (mountedRef.current) setUser(profile);
            } else {
              setUser(null);
              if (event === 'TOKEN_REFRESHED') {
                toast.error('Session expired. Please login again.');
              }
            }
            break;
          }
          case 'SIGNED_OUT': {
            setUser(null);
            break;
          }
          default:
            break;
        }
      });

      // onAuthStateChange returns synchronously: { data: { subscription } }
      // Guard against the Proxy no-op path which returns a Promise instead.
      if (data && typeof data.subscription?.unsubscribe === 'function') {
        subscription = data.subscription;
      }
    } catch (err) {
      console.error('[AUTH] Failed to set up auth listener:', err);
      // Even if the listener fails, make sure loading resolves
      resolveLoading();
    }

    return () => {
      mountedRef.current = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
