import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Lazily-created singleton — avoids crashing during SSR/build
// when environment variables may not be defined.
let _client = null;

function getClient() {
  if (_client) return _client;

  if (!supabaseUrl || !supabaseAnonKey) {
    // During Vercel build/prerender the NEXT_PUBLIC_ vars are injected at runtime,
    // not build time. Return a no-op placeholder so imports don't crash.
    if (typeof window === 'undefined') {
      // Server/build context — return a dummy object; no real calls happen here
      console.warn('[supabase] Missing env vars — running in build context, skipping client init.');
      return null;
    }
    console.error('[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing.');
    return null;
  }

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return _client;
}

// Export a Proxy so every `supabase.something` call lazily creates the client.
// This means the module can be imported in any file without crashing at build time.
export const supabase = new Proxy(
  {},
  {
    get(_target, prop) {
      const client = getClient();
      if (!client) {
        // Return a no-op function so destructured calls don't throw
        return typeof prop === 'string'
          ? new Proxy(() => Promise.resolve({ data: null, error: new Error('Supabase not initialised') }), {
              get: (_t, p) => new Proxy(() => Promise.resolve({ data: null, error: null }), { get: (_t2, _p2) => () => Promise.resolve({ data: null, error: null }) }),
            })
          : undefined;
      }
      const val = client[prop];
      return typeof val === 'function' ? val.bind(client) : val;
    },
  }
);
