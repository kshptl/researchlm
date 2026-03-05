import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const CHECKSUM_EXTENSIONS = new Set([
  ".dmg",
  ".zip",
  ".exe",
  ".appimage",
  ".deb",
]);
const releaseDir = path.resolve("release");

function readLabelArg() {
  const labelFlag = "--label";
  const index = process.argv.indexOf(labelFlag);
  if (index === -1) {
    return null;
  }

  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${labelFlag}`);
  }

  return value;
}

async function walkFiles(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath)));
      continue;
    }
    if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function sha256(filePath) {
  return await new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join("/");
}

async function main() {
  const label = readLabelArg();
  const outputName = label ? `SHA256SUMS-${label}.txt` : "SHA256SUMS.txt";
  const outputPath = path.join(releaseDir, outputName);

  const releaseStats = await stat(releaseDir).catch(() => null);
  if (!releaseStats?.isDirectory()) {
    throw new Error(`release directory not found: ${releaseDir}`);
  }

  const allFiles = await walkFiles(releaseDir);
  const targetFiles = allFiles
    .filter((filePath) =>
      CHECKSUM_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
    )
    .sort((a, b) => a.localeCompare(b));

  if (targetFiles.length === 0) {
    throw new Error("No release artifacts found to checksum.");
  }

  const lines = [];
  for (const filePath of targetFiles) {
    const digest = await sha256(filePath);
    const relPath = normalizePath(path.relative(releaseDir, filePath));
    lines.push(`${digest}  ${relPath}`);
  }

  await writeFile(outputPath, `${lines.join("\n")}\n`, "utf8");
  console.log(
    `Wrote ${outputName} with ${targetFiles.length} artifact checksums.`,
  );
}

await main();
