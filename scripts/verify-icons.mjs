import fs from 'node:fs';
import path from 'node:path';
import * as lucide from 'lucide-react';
import * as phosphor from '@phosphor-icons/react';

function walk(dir) {
  let files = [];
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, f.name);
    if (f.isDirectory() && !['node_modules', 'out', 'dist', '.git'].includes(f.name)) {
      files = files.concat(walk(full));
    } else if (f.isFile() && /\.(tsx|ts)$/.test(f.name)) {
      files.push(full);
    }
  }
  return files;
}

const files = walk(path.resolve('src'));
let issues = 0;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');

  // Check lucide
  const lucideMatches = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/g) || [];
  for (const m of lucideMatches) {
    const match = /import\s*\{([^}]+)\}\s*from\s*['"]lucide-react['"]/.exec(m);
    if (!match) continue;
    const names = match[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (let n of names) {
      if (n.startsWith('type ')) continue;
      const clean = n.split(/\s+as\s+/)[0].trim();
      if (clean && !lucide[clean]) {
        console.error('[LUCIDE MISSING]:', clean, 'in', path.relative(process.cwd(), file));
        issues++;
      }
    }
  }

  // Check phosphor
  const phosphorMatches = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@phosphor-icons\/react['"]/g) || [];
  for (const m of phosphorMatches) {
    const match = /import\s*\{([^}]+)\}\s*from\s*['"]@phosphor-icons\/react['"]/.exec(m);
    if (!match) continue;
    const names = match[1].split(',').map((s) => s.trim()).filter(Boolean);
    for (let n of names) {
      if (n.startsWith('type ')) continue;
      const clean = n.split(/\s+as\s+/)[0].trim();
      if (clean && !phosphor[clean]) {
        console.error('[PHOSPHOR MISSING]:', clean, 'in', path.relative(process.cwd(), file));
        issues++;
      }
    }
  }
}

if (issues === 0) {
  console.log('[ALL ICONS VERIFIED] 100% of Lucide and Phosphor imports exist and are valid!');
} else {
  console.error(`[FAILED] ${issues} non-existent icon imports detected!`);
  process.exit(1);
}
