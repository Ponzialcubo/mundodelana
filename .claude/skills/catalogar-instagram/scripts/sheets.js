// Builds numbered contact sheets (one tile per Instagram post) + an index with captions.
const sharp = require("/opt/sites/mundodelana/node_modules/sharp");
const fs = require("fs"), path = require("path");
const [libFile, uploads, outDir] = process.argv.slice(2);
const lib = JSON.parse(fs.readFileSync(libFile, "utf8"));
const posts = [];
for (const m of lib) {
  let p = posts.find((x) => x.post === m.post);
  if (!p) posts.push((p = { post: m.post, caption: m.caption, date: m.date, items: [] }));
  p.items.push(m);
}
const W = 320, H = 400, COLS = 4, ROWS = 3, PER = COLS * ROWS;
(async () => {
  const index = [];
  for (let s = 0; s * PER < posts.length; s++) {
    const tiles = [];
    for (let i = 0; i < PER && s * PER + i < posts.length; i++) {
      const n = s * PER + i + 1, p = posts[n - 1];
      const first = p.items.find((m) => m.type === "IMAGE") ?? p.items[0];
      const file = path.join(uploads, path.basename(first.type === "VIDEO" ? first.poster : first.url));
      const img = await sharp(file).resize(W, H, { fit: "cover" }).toBuffer();
      const label = Buffer.from(`<svg width="${W}" height="44"><rect width="100%" height="100%" fill="black" opacity="0.65"/><text x="10" y="31" font-size="26" font-family="sans-serif" fill="white">#${n} · ${p.items.length}${p.items.some((m) => m.type === "VIDEO") ? " vid" : ""}</text></svg>`);
      tiles.push({ input: await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer(), left: (i % COLS) * W, top: Math.floor(i / COLS) * H });
      index.push({ n, post: p.post, date: (p.date || "").slice(0, 10), count: p.items.length, ids: p.items.map((m) => m.id), caption: (p.caption || "").replace(/\s+/g, " ").slice(0, 220) });
    }
    await sharp({ create: { width: W * COLS, height: H * ROWS, channels: 3, background: "#fff" } }).composite(tiles).jpeg({ quality: 70 }).toFile(path.join(outDir, `sheet-${String(s + 1).padStart(2, "0")}.jpg`));
  }
  fs.writeFileSync(path.join(outDir, "index.json"), JSON.stringify(index, null, 1));
  console.log(posts.length, "posts,", Math.ceil(posts.length / PER), "sheets");
})();
