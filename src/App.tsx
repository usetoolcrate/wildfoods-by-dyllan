import { AuthStrategyRoutes } from "./auth/AuthStrategyRoutes";
import ErrorBoundary from "./components/ErrorBoundary";
import { ViktorSpacePreviewBadge } from "./components/ViktorSpacePreviewBadge";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="system" switchable>
          <AuthStrategyRoutes />
        </ThemeProvider>
      </ErrorBoundary>
      {/* Outside the boundary on purpose: a preview must stay labelled even
          on the crash screen the boundary renders instead of the app. */}
      <ViktorSpacePreviewBadge />
    </>
  );
}

export default App;
