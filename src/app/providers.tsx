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
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    // <ClerkProvider
    //   publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    // >
    <QueryClientProvider client={queryClient}>
      {/* <AutoLogoutProvider> */}
      {/* <FilterContextWrapper> */}
      {/* <SidebarProvider>
 
                <AppSidebar /> */}

      <main className="flex flex-col w-full max-w-full p-4">
        {/* <SidebarTrigger />
         */}

        <div className="">{children}</div>
      </main>

      {/* <Toaster />
            </SidebarProvider>
          </FilterContextWrapper> */}
    </QueryClientProvider>
    // </ClerkProvider>
  );
}
