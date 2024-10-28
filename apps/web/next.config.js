/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
    typescript: { //TODO added until fix all typescript/ biome cosmetic errors
        ignoreBuildErrors: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      images: {
        remotePatterns: [
          {
            protocol: "https",
            hostname: "cdn.discordapp.com",
          },
        ],
      },
};

export default config;
