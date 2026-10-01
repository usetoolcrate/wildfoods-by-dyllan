import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  // Local dev only: /api goes to scripts/dev-api.ts (bun scripts/dev-api.ts).
  server: {
    // Keep the browser's Host header so Stripe return links point back at Vite, not the API port.
    proxy: { "/api": { target: "http://localhost:3011", changeOrigin: false } },
  },
});
