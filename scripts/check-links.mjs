// Verifies every internal link and #anchor in the built site (run after `npm run build`).
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, posix } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const base = (process.env.BASE_PATH ?? '/naluz-framework-docs').replace(/\/$/, '');

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
  });
}

const files = walk(dist);
const idsCache = new Map();
const ids = (file) => {
  if (!idsCache.has(file)) {
    const html = readFileSync(file, 'utf8');
    idsCache.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1])));
  }
  return idsCache.get(file);
};

let bad = 0;
let checked = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const pageUrl = base + '/' + file.slice(dist.length).replace(/index\.html$/, '');
  for (const m of html.matchAll(/<a\s[^>]*href="([^"]*)"/g)) {
    let href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:|tel:|javascript:)/.test(href) || href === '') continue;
    checked++;
    const [pathPart, hash] = href.split('#');
    let target;
    if (pathPart === '') target = pageUrl;
    else if (pathPart.startsWith('/')) target = pathPart;
    else target = posix.normalize(posix.join(pageUrl.endsWith('/') ? pageUrl : posix.dirname(pageUrl) + '/', pathPart));
    if (!target.startsWith(base + '/') && target !== base) { console.log(`✗ ${pageUrl}: ${href} (outside ${base})`); bad++; continue; }
    const rel = target.slice(base.length).replace(/^\//, '');
    const candidates = [join(dist, rel, 'index.html'), join(dist, rel)];
    const found = candidates.find((c) => existsSync(c) && statSync(c).isFile());
    if (!found) { console.log(`✗ ${pageUrl}: ${href} → missing page`); bad++; continue; }
    if (hash && found.endsWith('.html') && !ids(found).has(decodeURIComponent(hash))) {
      console.log(`✗ ${pageUrl}: ${href} → missing anchor #${hash}`); bad++;
    }
  }
}
console.log(`${files.length} pages, ${checked} internal links checked, ${bad} problem(s).`);
process.exit(bad ? 1 : 0);
