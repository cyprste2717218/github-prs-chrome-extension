import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        "service-worker": path.resolve(
          __dirname,
          "./src/utilities/service-worker-funcs/service-worker.ts"
        ),
        background: path.resolve(
          __dirname,
          "./src/utilities/service-worker-funcs/background.ts"
        ),
        "alarm-utils": path.resolve(
          __dirname,
          "./src/utilities/service-worker-funcs/alarm-utils.ts"
        ),
        "storage-utils": path.resolve(
          __dirname,
          "./src/utilities/service-worker-funcs/storage-utils.ts"
        ),
      },
      output: {
        assetFileNames: "assets/[name]-[hash][extname]",
        entryFileNames: (assetInfo) => {
          if (assetInfo.name === "main") {
            return "assets/[name]-[hash].js";
          }
          return "[name].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
