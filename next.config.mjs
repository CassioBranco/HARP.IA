/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Sharp precisa ser externo no bundle do servidor (Next.js 14 + Vercel)
    serverComponentsExternalPackages: ['sharp'],
    // ...mas externo nao garante que os binarios nativos (@img/sharp-linux-x64
    // + libvips) entrem no bundle da função na Vercel. Sem eles, o runtime
    // linux estoura "Could not load the sharp module". Forca a inclusao.
    outputFileTracingIncludes: {
      '/api/images/upload': [
        './node_modules/sharp/**/*',
        './node_modules/@img/**/*',
      ],
    },
  },
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
