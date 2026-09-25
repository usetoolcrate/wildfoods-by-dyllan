import { Navigate, Outlet, Route, Routes } from "react-router";
import { PublicLandingPage } from "@/pages/PublicLandingPage";
import { StoryPage } from "@/pages/site/StoryPage";
import { DineWithUsPage } from "@/pages/site/DineWithUsPage";
import { PrivateChefPage } from "@/pages/site/PrivateChefPage";
import { LearnPage } from "@/pages/site/LearnPage";
import { RecipesPage } from "@/pages/site/RecipesPage";
import { ShopPage } from "@/pages/site/ShopPage";
import { ContactPage } from "@/pages/site/ContactPage";
import { AdminRecipesPage } from "@/pages/site/AdminRecipesPage";
import { QuestionsPage } from "@/pages/site/QuestionsPage";
import { AdminQuestionsPage } from "@/pages/site/AdminQuestionsPage";

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
        <Route path="/story" element={<StoryPage />} />
        <Route path="/dine-with-us" element={<DineWithUsPage />} />
        <Route path="/private-chef" element={<PrivateChefPage />} />
        <Route path="/learn" element={<LearnPage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/admin/recipes" element={<AdminRecipesPage />} />
        <Route path="/questions" element={<QuestionsPage />} />
        <Route path="/admin/questions" element={<AdminQuestionsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
