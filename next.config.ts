import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-core", "puppeteer", "whatsapp-web.js", "qrcode-terminal"],
};

export default nextConfig;
