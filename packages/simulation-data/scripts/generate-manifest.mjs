import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = fileURLToPath(new URL(".", import.meta.url));

const scenarioDir = resolve(scriptDir, "../scenarios/payment-provider-degradation");

const manifestPath = resolve(scenarioDir, "manifest.csv");

async function findCsvFiles(directory) {
  const entries = await readdir(directory, {
    withFileTypes: true,
  });

  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === "oracle") {
        continue;
      }

      files.push(...(await findCsvFiles(fullPath)));
      continue;
    }

    if (
      entry.isFile() &&
      extname(entry.name).toLowerCase() === ".csv" &&
      fullPath !== manifestPath
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function inspectCsv(content) {
  const normalized = content.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return {
      rows: 0,
      columns: 0,
    };
  }

  const lines = normalized.split("\n");
  const header = lines[0];

  return {
    rows: Math.max(lines.length - 1, 0),
    columns: header.split(",").length,
  };
}

const files = await findCsvFiles(scenarioDir);

files.sort((a, b) => relative(scenarioDir, a).localeCompare(relative(scenarioDir, b)));

const manifestRows = [];

for (const filePath of files) {
  const content = await readFile(filePath);

  const text = content.toString("utf8");
  const { rows, columns } = inspectCsv(text);

  const relativePath = relative(scenarioDir, filePath).replaceAll("\\", "/");

  manifestRows.push({
    file: relativePath,
    rows,
    columns,
    sha256: sha256(content),
  });
}

const manifest = [
  "file,rows,columns,sha256",
  ...manifestRows.map(({ file, rows, columns, sha256 }) => `${file},${rows},${columns},${sha256}`),
  "",
].join("\n");

await writeFile(manifestPath, manifest, "utf8");

console.log(`Generated manifest for ${manifestRows.length} CSV files.`);
console.log(manifestPath);
