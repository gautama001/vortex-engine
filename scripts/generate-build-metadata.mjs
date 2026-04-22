import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const generatedDir = path.join(rootDir, "src", "generated");
const publicDir = path.join(rootDir, "public");
const explicitReleaseMarker = process.env.VORTEX_RELEASE_MARKER?.trim() || "";
const commitSha =
  process.env.HOSTINGER_GIT_COMMIT_SHA?.trim() ||
  process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
  process.env.GIT_COMMIT_SHA?.trim() ||
  "";
const release = explicitReleaseMarker || commitSha || "local-dev";
const builtAt = new Date().toISOString();

const buildMetadata = {
  builtAt,
  commitSha: commitSha || null,
  release,
};

const buildMetadataModule = `export const BUILD_METADATA = ${JSON.stringify(
  buildMetadata,
  null,
  2,
)} as const;\n`;

await mkdir(generatedDir, { recursive: true });
await mkdir(publicDir, { recursive: true });

await writeFile(
  path.join(generatedDir, "build-metadata.ts"),
  buildMetadataModule,
  "utf8",
);
await writeFile(
  path.join(publicDir, "build-state.json"),
  `${JSON.stringify(buildMetadata, null, 2)}\n`,
  "utf8",
);
