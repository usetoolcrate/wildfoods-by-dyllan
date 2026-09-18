import { useConvexAuth } from "convex/react";
import { Navigate, Outlet, useLocation } from "react-router";
import { resolveSignedInReturn } from "@/auth/oauthReturn";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Skeleton } from "./ui/skeleton";

function AuthFormSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Skeleton className="h-9 w-32 mx-auto mb-8" />
        <Card>
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-6 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Skeleton className="h-4 w-48 mx-auto mt-4" />
      </div>
    </div>
  );
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const location = useLocation();

  if (isLoading) {
    return <AuthFormSkeleton />;
  }

  if (isAuthenticated) {
    // Back to the protected page ProtectedRoute bounced from, when there is
    // one (a sign-in that completed after the bounce), else the dashboard.
    return <Navigate to={resolveSignedInReturn(location.state)} replace />;
  }

  return <Outlet />;
}
