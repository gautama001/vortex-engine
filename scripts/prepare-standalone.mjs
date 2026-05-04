import { cp, mkdir, stat } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");

const exists = async (targetPath) => {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const copyIfPresent = async (sourcePath, destinationPath) => {
  if (!(await exists(sourcePath))) {
    return false;
  }

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await cp(sourcePath, destinationPath, {
    force: true,
    recursive: true,
  });

  return true;
};

if (!(await exists(standaloneDir))) {
  throw new Error("Missing .next/standalone. Run next build with output: standalone first.");
}

const copiedPublic = await copyIfPresent(
  path.join(rootDir, "public"),
  path.join(standaloneDir, "public"),
);
const copiedStatic = await copyIfPresent(
  path.join(rootDir, ".next", "static"),
  path.join(standaloneDir, ".next", "static"),
);

console.log(
  `Prepared standalone bundle for Hostinger (public=${copiedPublic}, static=${copiedStatic}).`,
);
