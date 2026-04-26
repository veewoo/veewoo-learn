"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";

// Dynamically import the PWA installer component to ensure it only runs client-side
const PWAInstall = dynamic(() => import("./PWAInstall"), {
  ssr: false,
});

// Create a client with aggressive anti-caching settings for iOS Safari compatibility
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Immediately consider data stale
      gcTime: 0, // Don't cache data in memory (was cacheTime in older versions)
      retry: 1, // Only retry once on failure
    },
  },
});

type Props = {
  children: React.ReactNode;
};

export default function App({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <PWAInstall />
      {children}
    </QueryClientProvider>
  );
}
