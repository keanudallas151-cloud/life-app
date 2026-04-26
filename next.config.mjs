import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // distDir is intentionally omitted — leave it at the default ".next" so
  // Vercel's Next.js adapter can locate the build artefacts automatically.
  outputFileTracingRoot: __dirname,
  generateBuildId: async () => "build-" + Date.now(),
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
