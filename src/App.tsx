import { PublicAppRoutes } from "./routes";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <PublicAppRoutes />
    </ErrorBoundary>
  );
}

export default App;
