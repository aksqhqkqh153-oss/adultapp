import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: (assetInfo) => {
          const ext = path.extname(assetInfo.name ?? "");
          if (ext === ".css") {
            return "assets/index.css";
          }
          return "assets/[name][extname]";
        }
      }
    }
  }
});
