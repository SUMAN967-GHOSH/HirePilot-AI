const nextConfig: import('next').NextConfig = {
  serverExternalPackages: ['pdf-parse', '@xenova/transformers'],
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
