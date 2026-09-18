import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  define: {
    "import.meta.env.VITE_VIKTOR_SPACES_ACCESS_MODE": JSON.stringify("public"),
    "import.meta.env.VITE_VIKTOR_SPACES_SPACE_ID": JSON.stringify("standalone"),
    "import.meta.env.VITE_VIKTOR_SPACES_API_URL": JSON.stringify(""),
    "import.meta.env.VITE_VIKTOR_AUTH_CLIENT_ID": JSON.stringify(""),
    "import.meta.env.VITE_CONVEX_URL": JSON.stringify(""),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
});
