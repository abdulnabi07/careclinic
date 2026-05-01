import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Server-only Supabase client with service role key
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in env');
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// Super admin email — only this email can create admins
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || '';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    // --- Validate input ---
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // --- Verify caller is super admin ---
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Not logged in.' }, { status: 401 });
    }
    const token = authHeader.replace('Bearer ', '');

    // Use the service role client to verify the JWT — this always works
    // regardless of RLS or anon key restrictions
    const supabaseAdmin = getAdminClient();
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      console.error('[create-admin] Auth error:', authError?.message);
      return NextResponse.json({ error: 'Invalid or expired session. Please login again.' }, { status: 401 });
    }

    // Only allow the super admin email
    if (caller.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'You are not authorized to perform this action.' }, { status: 403 });
    }

    // --- Create admin user ---
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Insert into users table with admin role
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({ id: newUser.user.id, name, role: 'admin' });

    if (insertError) {
      return NextResponse.json({ error: 'Auth user created but profile insert failed: ' + insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, userId: newUser.user.id });
  } catch (err) {
    console.error('[create-admin] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error.' }, { status: 500 });
  }
}
