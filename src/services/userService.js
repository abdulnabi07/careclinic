import { supabase } from '../lib/supabaseClient';

export const createWorker = async ({ name, email, password }) => {
  console.log('[WORKER] createWorker() called:', { name, email });

  // Step 1: Create auth user
  console.log('[WORKER] Calling supabase.auth.signUp...');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  console.log('[WORKER] auth.signUp response:', { data, error });

  if (error) {
    console.error('[WORKER] Auth signUp failed:', error.message);
    throw new Error("Failed to create auth account: " + error.message);
  }

  if (!data.user) {
    console.error('[WORKER] data.user is null — email confirmation is likely ON in Supabase.');
    throw new Error(
      "Worker account requires email confirmation. " +
      "Please go to Supabase Dashboard → Authentication → Settings and turn OFF 'Enable email confirmations'."
    );
  }

  console.log('[WORKER] Auth user created. user.id:', data.user.id);

  // Step 2: Insert into users table
  console.log('[WORKER] Inserting into users table...');
  const { data: insertData, error: insertError } = await supabase
    .from('users')
    .insert([{ id: data.user.id, name, role: 'worker' }])
    .select()
    .single();

  console.log('[WORKER] users table insert response:', { insertData, insertError });

  if (insertError) {
    console.error('[WORKER] Insert into users table failed:', insertError.message);
    throw new Error("Auth account created but failed to save worker profile: " + insertError.message);
  }

  console.log('[WORKER] Worker created successfully:', insertData);
  return insertData;
};

export const getWorkers = async () => {
  console.log('[WORKER] getWorkers() called');

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'worker');

  if (error) {
    console.error('[WORKER] getWorkers error:', error.message);
    throw error;
  }

  console.log('[WORKER] getWorkers result:', data?.length, 'workers');
  return data;
};

export const deleteWorker = async (id) => {
  console.log('[WORKER] deleteWorker() called for id:', id);

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[WORKER] deleteWorker error:', error.message);
    throw error;
  }

  console.log('[WORKER] deleteWorker success for id:', id);
};
