import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      "/api/pastebin": {
        target: "https://pastebin.com/api/api_post.php",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pastebin/, ""),
      },
    },
  },
});
