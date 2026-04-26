// import type { NextConfig } from "next";
// import withPWA from "next-pwa";

const nextConfig = {
  /* config options here */
  swcMinify: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mazii.net',
        port: '',
        pathname: '/assets/images/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
      },
      {
        protocol: 'https',
        hostname: 'www.svgrepo.com',
        port: '',
      },
    ],
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// const pwaConfig = withPWA({
//   dest: "public",
//   register: true,
//   skipWaiting: true,
//   disable: process.env.NODE_ENV === "development",
//   // Enable these options for better performance
//   runtimeCaching: [
//     {
//       urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com/,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'google-fonts',
//         expiration: {
//           maxEntries: 30,
//           maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
//         },
//       },
//     },
//     {
//       urlPattern: /\.(?:ico|png|jpg|jpeg|svg|webp|gif)$/i,
//       handler: 'CacheFirst',
//       options: {
//         cacheName: 'images',
//         expiration: {
//           maxEntries: 100,
//           maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//         },
//       },
//     },
//     {
//       urlPattern: /\.(?:js)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'js-cache',
//       },
//     },
//     {
//       urlPattern: /\.(?:css)$/i,
//       handler: 'StaleWhileRevalidate',
//       options: {
//         cacheName: 'css-cache',
//       },
//     },
//   ],
// })(nextConfig);

export default nextConfig;
