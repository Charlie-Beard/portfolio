import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const htmlFiles = [];
await walk(root);

const problems = [];

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");

  if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
    problems.push(`${relative(file)} is missing a <title>.`);
  }

  if (!/<meta\s+name="description"\s+content="[^"]+"/i.test(html)) {
    problems.push(`${relative(file)} is missing a meta description.`);
  }

  const matches = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)];
  for (const match of matches) {
    const target = match[1];
    if (
      !target ||
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:") ||
      target.startsWith("#") ||
      target.startsWith("javascript:")
    ) {
      continue;
    }

    const resolved = target.startsWith("/")
      ? path.join(root, target)
      : path.resolve(path.dirname(file), target);

    const exists = await resolveTarget(resolved, target.endsWith("/"));
    if (!exists) {
      problems.push(`${relative(file)} references missing asset or page: ${target}`);
    }
  }
}

if (problems.length) {
  console.error("Site check failed:\n");
  problems.forEach((problem) => console.error(`- ${problem}`));
  process.exitCode = 1;
} else {
  console.log(`Checked ${htmlFiles.length} HTML files. No missing links or metadata problems found.`);
}

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".html")) {
      htmlFiles.push(fullPath);
    }
  }
}

async function resolveTarget(target, trailingSlash) {
  const attempts = trailingSlash
    ? [path.join(target, "index.html")]
    : [target, `${target}.html`, path.join(target, "index.html")];

  for (const attempt of attempts) {
    try {
      await stat(attempt);
      return true;
    } catch {
      continue;
    }
  }

  return false;
}

function relative(file) {
  return path.relative(root, file) || ".";
}
