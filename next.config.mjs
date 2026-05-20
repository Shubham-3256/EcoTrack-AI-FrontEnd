/** @type {import('next').NextConfig} */
const nextConfig = {
  // No rewrites needed: lib/api.ts calls NEXT_PUBLIC_API_BASE directly.
  // Local dev -> NEXT_PUBLIC_API_BASE=http://localhost:5000
  // Production -> NEXT_PUBLIC_API_BASE=https://your-backend.onrender.com
};

export default nextConfig;
