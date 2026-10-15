/**
 * One-off codemod: converts the legacy `assets/js/algorithms/*.js` files
 * (which call `viz.register(id, { ... })`) into typed TS modules under
 * `src/content/lessons/`.
 *
 * The legacy objects are already pure data + a pure `steps()` function, so the
 * transformation is purely mechanical: keep the object literal, add the `id`,
 * annotate it as a `Lesson`.
 *
 * Run: node scripts/convert-lessons.mjs
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';

const SRC = process.argv[2] ?? '/tmp/opencode/legacy/js/algorithms';
const OUT = process.argv[3] ?? 'src/content/lessons';

mkdirSync(OUT, { recursive: true });

let converted = 0;
for (const file of readdirSync(SRC).filter((f) => f.endsWith('.js'))) {
  const src = readFileSync(join(SRC, file), 'utf8');
  const match = src.match(/viz\.register\(\s*'([^']+)'/);
  if (!match) {
    console.warn(`skip (no registration): ${file}`);
    continue;
  }
  const id = match[1];
  const open = src.indexOf('{', src.indexOf('viz.register('));
  const close = src.lastIndexOf('}');
  let body = src.slice(open + 1, close).replace(/\s+$/, '');

  // The legacy code is untyped; add the obvious annotations the strict config
  // needs. Everything else is finished by hand.
  const usesStep = /const out = \[\];/.test(body);
  const usesNode = /const nodes = \{\};/.test(body);
  body = body
    .replace(/const out = \[\];/g, 'const out: Step[] = [];')
    .replace(/const sorted = \[\];/g, 'const sorted: number[] = [];')
    .replace(/const nodes = \{\};/g, 'const nodes: Record<string, Node> = {};');

  const imports = ['Lesson', ...(usesStep ? ['Step'] : []), ...(usesNode ? ['Node'] : [])];

  const out = `import type { ${imports.join(', ')} } from '@/engine/types';

export const lesson: Lesson = {
  id: ${JSON.stringify(id)},${body}
};
`;
  writeFileSync(join(OUT, `${id}.ts`), out);
  converted += 1;
}

console.log(`Converted ${converted} lesson(s) from ${basename(SRC)} → ${OUT}`);
