import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// Static React SPA, deployable to GitHub Pages. `base: './'` keeps assets
// path-relative so it works at any subpath.
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
