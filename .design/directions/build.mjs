// node build.mjs [letter...]  — builds directions D–I from src/*.mjs
import { writeFileSync } from 'node:fs';
import { page } from './src/base.mjs';
const all = ['d', 'e', 'f', 'g', 'h', 'i'];
const want = process.argv.slice(2).length ? process.argv.slice(2) : all;
for (const k of want) {
  const m = (await import(`./src/${k}.mjs`)).default;
  writeFileSync(new URL(`./${m.slug}.html`, import.meta.url), page(m));
  console.log('built', m.slug);
}
