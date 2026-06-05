/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Protótipo — ESLint roda separado no CI; não bloqueia o build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // TypeScript stricto é validado localmente; não bloqueia deploy do protótipo
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
