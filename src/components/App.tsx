"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
