"use client";

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
  const router = useRouter();
  const pathname = usePathname();

  // Fetch the user's profile (role + name) from the users table
  const fetchProfile = useCallback(async (authUser) => {
    if (!authUser) return null;
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (error) {
      console.error('[AUTH] fetchProfile error:', error.message);
      return { ...authUser, role: 'worker', name: authUser.email };
    }
    return { ...authUser, ...data };
  }, []);

  useEffect(() => {
    // 1. Restore session on mount
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await fetchProfile(session.user);
          setUser(profile);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('[AUTH] init error:', err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();

    // 2. Listen for auth changes (token expiry, logout, login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] onAuthStateChange:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Session silently refreshed — update user
        const profile = await fetchProfile(session.user);
        setUser(profile);
      } else if (!session && event !== 'INITIAL_SESSION') {
        // Session expired
        setUser(null);
        toast.error('Session expired. Please login again.');
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, router]);

  const value = { user, loading, setUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
