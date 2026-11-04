/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger's build host reports ~63 CPUs but caps threads per account, so the default worker pool aborts the build.
  experimental: { cpus: 2 },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
    ],
  },
};

export default nextConfig;
