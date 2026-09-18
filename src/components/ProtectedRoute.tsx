import { useConvexAuth } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";
import {
  BOUNCED_FROM_STATE_KEY,
  stripAutoSignInIntent,
} from "@/auth/oauthReturn";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
} from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";

function AppSkeleton() {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b border-sidebar-border">
          <div className="flex items-center gap-2.5 px-2 py-1">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-16" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <div className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarContent>
        <SidebarFooter className="border-t border-sidebar-border">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <Skeleton className="size-7 rounded-md" />
          <div className="flex-1" />
        </header>
        <main className="flex-1 p-4 lg:p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
            <Skeleton className="h-32 rounded-lg" />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <AppSkeleton />;
  }

  if (!isAuthenticated) {
    // Carry the page being left so PublicOnlyRoute can return a visitor who
    // signs in on /login (e.g. the edge hand-off completing) to it, not to
    // the dashboard. The intent param is spent on arrival and never returns.
    return (
      <Navigate
        to="/login"
        replace
        state={{
          [BOUNCED_FROM_STATE_KEY]: stripAutoSignInIntent(
            location.pathname,
            location.search,
          ),
        }}
      />
    );
  }

  return <Outlet />;
}
