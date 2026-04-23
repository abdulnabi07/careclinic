/** @type {import('next').NextConfig} */
const nextConfig = {
  // Dashboard pages use Supabase Auth and cannot be statically prerendered.
  // This prevents the "supabaseUrl is required" error during Vercel build.
  experimental: {},

  // Silence the Turbopack multi-lockfile warning
  turbopack: {},
};

export default nextConfig;
