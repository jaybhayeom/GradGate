#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_PATTERNS = [
  /\bTODO\b/,
  /\bFIXME\b/,
  /Sample Question \d+/i,
  /Placeholder explanation/i,
  /Lorem ipsum/i,
  /YOUR_VIDEO_ID_HERE/i,
  /dQw4w9WgXcQ/
];

function scanDir(dir, errors = []) {
  if (!fs.existsSync(dir)) return errors;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', 'dist', 'out', '.git'].includes(entry.name)) {
      scanDir(fullPath, errors);
    } else if (/\.(ts|tsx|sql|json)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      for (const regex of FORBIDDEN_PATTERNS) {
        if (regex.test(content)) {
          errors.push(`${path.relative(process.cwd(), fullPath)} matched forbidden pattern: ${regex}`);
        }
      }
    }
  }
  return errors;
}

const issues = scanDir(path.resolve(process.cwd(), 'src'));
if (issues.length > 0) {
  console.error('[PLACEHOLDER SCAN FAILED]:');
  issues.forEach((i) => console.error(`  - ${i}`));
  process.exit(1);
}
console.log('[PLACEHOLDER SCAN PASS] Zero placeholders or dummy stubs found in src/.');
