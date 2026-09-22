/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep ffmpeg-static outside the Next.js webpack server bundle so the
  // native executable remains a real file under node_modules at runtime.
  serverExternalPackages: ["ffmpeg-static"]
};

module.exports = nextConfig;
