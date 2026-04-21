const explicitReleaseMarker = process.env.VORTEX_RELEASE_MARKER?.trim();
const gitSha =
  process.env.HOSTINGER_GIT_COMMIT_SHA?.trim() ||
  process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
  process.env.GIT_COMMIT_SHA?.trim() ||
  "";

export const RELEASE_MARKER = explicitReleaseMarker || gitSha || "2026-04-21-runtime-hardening";
