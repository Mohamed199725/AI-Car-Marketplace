/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsHmrCache: false, // defaults to true
    serverActions: {
      // addCar() sends images as base64 data URLs, which inflate file size by
      // ~33%. The form allows 5MB per image (up to several at once), so the
      // 1MB default makes Next.js reject the payload with
      // "An unexpected response was received from the server".
      bodySizeLimit: "25mb",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aioabhapgydxfmzcsacm.supabase.co",
      },
      {
        // Sample/placeholder car images used by scripts/seed-cars.js
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/embed",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://roadsidecoder.created.app;",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
