const nextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "mazii.net",
        port: "",
        pathname: "/assets/images/**",
      },
      {
        protocol: "https",
        hostname: "www.svgrepo.com",
        port: "",
      },
    ],
  },
};

export default nextConfig;
