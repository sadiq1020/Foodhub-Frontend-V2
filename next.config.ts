// import type { NextConfig } from "next";

// const BACKEND_URL = "https://ph-next-level-b6a4-foodhub-backend.onrender.com";

// const nextConfig: NextConfig = {
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "images.unsplash.com",
//       },
//       {
//         protocol: "https",
//         hostname: "deifkwefumgah.cloudfront.net",
//       },
//     ],
//     formats: ["image/webp"],
//   },
//   async rewrites() {
//     return [
//       // ✅ Auth routes
//       {
//         source: "/api/auth/:path*",
//         destination: `${BACKEND_URL}/api/auth/:path*`,
//       },
//       // ✅ ALL backend API calls through /api prefix
//       {
//         source: "/api/v1/:path*",
//         destination: `${BACKEND_URL}/:path*`,
//       },
//     ];
//   },
// };

// export default nextConfig;

// ✅ Add proxy rewrites
// async rewrites() {
//   return [
//     {
//       source: "/api/auth/:path*",
//       destination: `${env.BACKEND_URL}/api/auth/:path*`,
//     },
//     {
//       source: "/api/:path*",
//       destination: `${env.BACKEND_URL}/:path*`,
//     },
//   ];
// },

import type { NextConfig } from "next";

// Use env variable so local dev hits localhost:5000
// and production hits the Render backend
const BACKEND_URL =
  process.env.BACKEND_URL ||
  "https://ph-next-level-b6a4-foodhub-backend.onrender.com";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "deifkwefumgah.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com", // ← add this
      },
    ],
    formats: ["image/webp"],
  },
  async rewrites() {
    return [
      // ⚠️ REMOVED: /api/auth/:path* is NO LONGER proxied
      // Reason: Auth client now points DIRECTLY to the backend.
      // The backend properly sets SameSite: None; Secure cookies,
      // and the browser can send them via credentials: "include".
      // Proxying through Vercel breaks Set-Cookie header forwarding.

      // All other API calls → proxied to backend
      {
        source: "/api/v1/:path*",
        destination: `${BACKEND_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
