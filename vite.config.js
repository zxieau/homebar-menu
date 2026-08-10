import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages uses /homebar-menu/; alternate hosts can build for their root.
  base: process.env.VITE_BASE_PATH || "/homebar-menu/",
  plugins: [react()]
});
