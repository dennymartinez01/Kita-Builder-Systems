import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Increase serverless function timeout for webhook (Gemini + Supabase can be slow)
  // Vercel Hobby: max 60s. Pro: max 300s.
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
