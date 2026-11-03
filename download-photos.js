// Run once (needs internet):  npm run photos
// Downloads real product photos from dummyjson.com into img/products/ and
// updates data/*.json to use them. After this the site works fully offline.
const fs = require("fs");
const path = require("path");

const SOURCES = {
  mens: ["mens-shirts"],
  womens: ["womens-dresses", "tops"],
  jewellery: ["womens-jewellery"],
};
const OUT = path.join(__dirname, "img", "products");
fs.mkdirSync(OUT, { recursive: true });

async function getJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + " -> HTTP " + r.status);
  return r.json();
}
async function download(url, file) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(url + " -> HTTP " + r.status);
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
}

(async () => {
  for (const [key, cats] of Object.entries(SOURCES)) {
    const pool = []; // {title, url}
    for (const c of cats) {
      try {
        const d = await getJSON(`https://dummyjson.com/products/category/${c}?limit=30`);
        for (const p of d.products) {
          const imgs = [p.thumbnail, ...(p.images || [])].filter(Boolean);
          const seen = new Set();
          for (const u of imgs) if (!seen.has(u)) { seen.add(u); pool.push({ title: p.title, url: u }); }
        }
      } catch (e) { console.log("  skip category", c, "-", e.message); }
    }
    if (!pool.length) { console.log(`[${key}] no photos found, keeping current images`); continue; }

    const file = path.join(__dirname, "data", key + ".json");
    const items = JSON.parse(fs.readFileSync(file, "utf8"));
    let ok = 0;
    for (let i = 0; i < items.length; i++) {
      const src = pool[i % pool.length];
      const name = `${key}_${i + 1}.jpg`;
      try {
        await download(src.url, path.join(OUT, name));
        items[i].image = `./img/products/${name}#${key}_${i + 1}`; // '#...' = fallback placeholder name
        items[i].title = src.title;
        ok++;
      } catch (e) { console.log("  failed", name, "-", e.message); }
    }
    fs.writeFileSync(file, JSON.stringify(items, null, 1));
    console.log(`[${key}] ${ok}/${items.length} photos saved`);
  }
  console.log("Done. Refresh the browser with Ctrl+Shift+R");
})();
