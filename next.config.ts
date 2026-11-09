import type { NextConfig } from 'next'

const config: NextConfig = {
  agentRules: false,
  devIndicators: false,
  turbopack: { root: __dirname },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ]
  },
}

export default config
