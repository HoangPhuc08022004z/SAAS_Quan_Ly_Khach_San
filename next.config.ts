import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cho phép mở dev server qua đường hầm công khai (cloudflared/ngrok) để người khác test
  allowedDevOrigins: ["*.trycloudflare.com", "*.ngrok-free.dev", "*.ngrok-free.app"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
