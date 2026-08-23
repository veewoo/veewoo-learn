"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure
    },
  },
});

type Props = {
  children: React.ReactNode;
};

export default function App({ children }: Props) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
