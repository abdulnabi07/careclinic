// Force all dashboard routes to be dynamic (never statically prerendered).
// This prevents Next.js from calling Supabase during `next build`.
export const dynamic = 'force-dynamic';
