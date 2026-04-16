import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  distDir: "dist",
  outputFileTracingRoot: __dirname,
  generateBuildId: async () => "build-" + Date.now(),
};

export default nextConfig;
