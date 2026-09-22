/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep ffmpeg-static as a real server dependency instead of rewriting
  // the native binary into a Next.js server chunk.
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/*": ["./node_modules/ffmpeg-static/ffmpeg"]
  }
};

module.exports = nextConfig;
