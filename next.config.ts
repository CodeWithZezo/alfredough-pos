import type { NextConfig } from "next";
import { execSync } from "node:child_process";
import pkg from "./package.json";

// Short commit hash of the source this build was produced from, so every
// running build can be traced back to its exact version in Git.
function commitSha(): string {
  const fromCi = process.env.GITHUB_SHA ?? process.env.VERCEL_GIT_COMMIT_SHA;
  if (fromCi) return fromCi.slice(0, 7);
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_VERSION: pkg.version,
    NEXT_PUBLIC_COMMIT_SHA: commitSha(),
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString(),
  },
};

export default nextConfig;
