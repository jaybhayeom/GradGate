#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LOCK_FILE = path.resolve(process.cwd(), 'edition-lock.json');
const mode = process.argv[2]; // 'verify' | 'lock'
const phaseName = process.argv[3] || 'unspecified-phase';
const targetDirs = process.argv.slice(4);

function hashFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function walkDir(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', 'out', '.git'].includes(entry.name)) {
        walkDir(fullPath, fileList);
      }
    } else if (/\.(ts|tsx|sql|json|css)$/.test(entry.name) && entry.name !== 'edition-lock.json') {
      fileList.push(path.relative(process.cwd(), fullPath));
    }
  }
  return fileList;
}

const lockData = fs.existsSync(LOCK_FILE)
  ? JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'))
  : { edition: 1, lockedPhases: [], files: {} };

if (mode === 'verify') {
  const violations = [];
  for (const [relPath, meta] of Object.entries(lockData.files)) {
    const absPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(absPath)) {
      violations.push(`MISSING LOCKED FILE: ${relPath} (locked in ${meta.phase})`);
    } else {
      const currentHash = hashFile(absPath);
      if (currentHash !== meta.sha256) {
        violations.push(`MODIFIED LOCKED FILE: ${relPath} (locked in ${meta.phase})`);
      }
    }
  }
  if (violations.length > 0) {
    console.error('\n[EDITION-LOCK FAILURE] Unauthorized changes detected in previous phase files:');
    violations.forEach((v) => console.error(`  - ${v}`));
    process.exit(1);
  }
  console.log(`[EDITION-LOCK PASS] All ${Object.keys(lockData.files).length} locked files match last edition checksums.`);
} else if (mode === 'lock') {
  const filesToLock = targetDirs.flatMap((d) => walkDir(path.resolve(process.cwd(), d)));
  for (const relPath of filesToLock) {
    if (!lockData.files[relPath]) {
      lockData.files[relPath] = {
        sha256: hashFile(path.resolve(process.cwd(), relPath)),
        phase: phaseName,
        lockedAt: new Date().toISOString()
      };
    }
  }
  if (!lockData.lockedPhases.includes(phaseName)) {
    lockData.lockedPhases.push(phaseName);
    lockData.edition += 1;
  }
  fs.writeFileSync(LOCK_FILE, JSON.stringify(lockData, null, 2));
  console.log(`[EDITION-LOCK UPDATED] Locked ${filesToLock.length} files for ${phaseName} (Edition v${lockData.edition}).`);
} else {
  console.error('Usage: node scripts/edition-lock.mjs <verify|lock> [phaseName] [dirs...]');
  process.exit(1);
}
