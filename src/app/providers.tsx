"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
// import FilterContextWrapper from "@/context/Filters/FilterContextWrapper";
// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
// import { Toaster } from "@/components/ui/sonner";
// import FilterContextWrapper from "@/context/Filters/FilterContextWrapper";
// import { AppSidebar } from "@/custom_components/Sidebar/AppSidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data doesn't change frequently
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache
            retry: 2, // Retry failed requests twice
            refetchOnWindowFocus: false, // Don't refetch on window focus (UX preference)
            refetchOnReconnect: true, // Refetch when reconnecting
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
