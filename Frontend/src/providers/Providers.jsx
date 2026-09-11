"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function Providers({ children }) {
  // useState ensures a single QueryClient instance per client-side render,
  // preventing re-creation on every render while still being SSR-safe.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Don't refetch on window focus in dev — avoids noisy re-renders
            refetchOnWindowFocus: false,
            // Retry failed requests once before showing error state
            retry: 1,
            // Keep data fresh for 60 seconds before marking as stale
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
