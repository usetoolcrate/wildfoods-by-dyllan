import { Navigate, Outlet, Route, Routes } from "react-router";
import { PublicLandingPage } from "@/pages/PublicLandingPage";

function PublicShell() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export function PublicAppRoutes() {
  return (
    <Routes>
      <Route element={<PublicShell />}>
        <Route path="/" element={<PublicLandingPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
