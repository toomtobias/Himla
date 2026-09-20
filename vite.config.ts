import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
const metProxy = {
  "/api/met": {
    target: "https://api.met.no",
    changeOrigin: true,
    rewrite: (path: string) => path.replace(/^\/api\/met/, ""),
    configure: (proxy: {
      on: (
        event: "proxyReq",
        fn: (proxyReq: { setHeader: (name: string, value: string) => void }) => void,
      ) => void;
    }) => {
      proxy.on("proxyReq", (proxyReq) => {
        proxyReq.setHeader(
          "User-Agent",
          "Himla/1.0 (swedish weather app; github.com/tobiastoom/himla)",
        );
      });
    },
  },
};

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: metProxy,
  },
  preview: {
    proxy: metProxy,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
