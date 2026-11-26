/** @type {import('next').NextConfig} */
const nextConfig = {
  // Hostinger's build host reports ~63 CPUs but caps threads per account, so the default worker pool aborts the build.
  experimental: {
    cpus: 2,
    agentUpgrade: "security",
    // Next.js caps a Server Action's request body at 1MB by default. The
    // bulk student upload posts an .xlsx file straight to a Server Action
    // (bulkCreateStudents) — a real roster file with normal formatting,
    // colors or a logo clears 1MB easily, so it was being rejected by the
    // framework before that action's own code ever ran.
    serverActions: { bodySizeLimit: "10mb" },
  },
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
