import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // AVIF first (~30 % lighter than WebP on photos), WebP as fallback.
    formats: ["image/avif", "image/webp"],
    // Phone-first widths: 2-column cards on a 390px screen at 2x need ~400px.
    deviceSizes: [390, 640, 828, 1080, 1366, 1920],
    imageSizes: [64, 96, 128, 192, 256, 384],
    qualities: [70, 75, 80],
    // Uploaded files never change (random names), so optimized copies can live long.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
