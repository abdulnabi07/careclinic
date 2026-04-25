/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix the "multiple lockfiles" Turbopack warning by explicitly setting the root
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
