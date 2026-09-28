import { cp, mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "files");
const output = path.join(root, "_site");

const escapeHtml = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const page = (title, body) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    :root { color-scheme: light dark; font-family: system-ui, sans-serif; }
    body { max-width: 52rem; margin: 3rem auto; padding: 0 1.25rem; line-height: 1.6; }
    img { max-width: 100%; }
    pre { overflow-x: auto; padding: 1rem; background: color-mix(in srgb, CanvasText 8%, Canvas); }
    code { font-family: ui-monospace, monospace; }
    a { color: LinkText; }
  </style>
</head>
<body>
${body}
</body>
</html>
`;

async function walk(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path.join(directory, entry.name), relative)));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files;
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(source, output, { recursive: true });

const sourceFiles = await walk(source);
const sourceFileSet = new Set(sourceFiles);
const publishedFiles = [...sourceFiles];

for (const relative of sourceFiles.filter((file) => file.toLowerCase().endsWith(".md"))) {
  const htmlRelative = relative.slice(0, -3) + ".html";
  if (sourceFileSet.has(htmlRelative)) continue;

  const markdown = await readFile(path.join(source, relative), "utf8");
  const title = path.basename(relative, path.extname(relative));
  await writeFile(path.join(output, htmlRelative), page(title, await marked.parse(markdown)));
  publishedFiles.push(htmlRelative);
}

const links = publishedFiles
  .sort((a, b) => a.localeCompare(b))
  .map((file) => `    <li><a href="${file.split("/").map(encodeURIComponent).join("/")}">${escapeHtml(file)}</a></li>`)
  .join("\n");

await writeFile(
  path.join(output, "index.html"),
  page("Public files", `<h1>Public files</h1>\n  <ul>\n${links}\n  </ul>`),
);
await writeFile(path.join(output, "CNAME"), "cdn.benkaiser.dev\n");
await writeFile(path.join(output, ".nojekyll"), "");
