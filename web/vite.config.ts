import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const backendTarget = process.env.HAIR_BOOKING_BACKEND_URL || "http://127.0.0.1:8080";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    proxy: {
      "/api": backendTarget,
      "/auth": backendTarget,
      "/uploads": backendTarget,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
