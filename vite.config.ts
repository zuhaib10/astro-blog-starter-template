import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
  },
  server: {
    proxy: {
      "/api": "http://localhost:4000",
      "/webhook": "http://localhost:4000",
    },
  },
});
