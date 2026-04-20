import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const buildVersion = String(Date.now());

export default defineConfig({
  define: {
    __APP_BUILD_VERSION__: JSON.stringify(buildVersion)
  },
  plugins: [
    react(),
    {
      name: "adultapp-version-file",
      generateBundle() {
        this.emitFile({
          type: "asset",
          fileName: "version.json",
          source: JSON.stringify({ version: buildVersion }, null, 2)
        });
      }
    }
  ],
  server: {
    port: 5173
  },
  build: {
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const ext = path.extname(assetInfo.name ?? "");
          if (ext === ".css") {
            return "assets/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        }
      }
    }
  }
});
