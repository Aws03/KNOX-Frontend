import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Third-party code changes far less often than the app: separate chunks stay cached across deploys.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return "react";
          if (id.includes("@radix-ui") || id.includes("lucide-react")) return "ui";
          if (id.includes("i18next")) return "i18n";
          if (id.includes("recharts") || id.includes("d3-")) return undefined; // only the analytics page needs charts
          return "vendor";
        },
      },
    },
  },
});
