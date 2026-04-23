import { supabase } from '../lib/supabaseClient';

export const signup = async (email, password, name) => {
  console.log('[AUTH] signup() called with email:', email);

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    console.error('[AUTH] signUp error:', error.message, error);
    throw error;
  }
  if (!data.user) {
    console.error('[AUTH] signUp returned no user - check if email confirmation is enabled in Supabase dashboard');
    throw new Error("Signup failed, no user returned.");
  }

  console.log('[AUTH] signUp success, user.id:', data.user.id);
  console.log('[AUTH] email_confirmed_at:', data.user.email_confirmed_at, '(null means confirmation email sent)');

  // Insert into users table
  const { error: insertError } = await supabase
    .from('users')
    .insert([{ id: data.user.id, name, role: 'worker' }]);

  if (insertError) {
    console.error('[AUTH] Error inserting into users table:', insertError);
    throw new Error("Failed to create user profile: " + insertError.message);
  }

  console.log('[AUTH] users table insert success');
  return data.user;
};

export const login = async (email, password) => {
  console.log('[AUTH] login() called with email:', email);
  console.log('[AUTH] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[AUTH] signInWithPassword error:', error.message, error);
    if (error.message.toLowerCase().includes('invalid login')) {
      throw new Error("Invalid email or password. Please try again.");
    }
    if (error.message.toLowerCase().includes('email not confirmed')) {
      throw new Error("Please confirm your email before logging in. Check your inbox.");
    }
    throw error;
  }

  console.log('[AUTH] signInWithPassword success, user.id:', data.user.id);
  console.log('[AUTH] user email:', data.user.email);

  // Fetch role from users table
  console.log('[AUTH] Fetching role from users table...');
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role, name')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    console.error('[AUTH] users table fetch error:', userError.message, userError);
    throw new Error("User profile not found in database. Please contact admin or sign up first.");
  }
  if (!userData) {
    console.error('[AUTH] No row found in users table for id:', data.user.id);
    throw new Error("User profile missing. Please sign up first.");
  }

  console.log('[AUTH] Role fetch success:', userData);
  console.log('[AUTH] role:', userData.role, '| name:', userData.name);

  return {
    ...data.user,
    role: userData.role,
    name: userData.name,
  };
};

export const logout = async () => {
  console.log('[AUTH] logout() called');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[AUTH] signOut error:', error.message);
    throw error;
  }
  console.log('[AUTH] logout success');
};

export const getCurrentUser = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    console.error('[AUTH] getSession error:', sessionError.message);
    return null;
  }
  if (!session) {
    console.log('[AUTH] getCurrentUser: no active session');
    return null;
  }

  console.log('[AUTH] getCurrentUser: session found for user.id:', session.user.id);

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (userError) {
    console.error('[AUTH] getCurrentUser users table error:', userError.message);
    return null;
  }

  return { ...session.user, ...userData };
};
