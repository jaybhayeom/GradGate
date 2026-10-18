#!/usr/bin/env node
// ==============================================================================
// GITHUB RELEASE BUNDLE GENERATOR FOR GRADGATE
// Compiles full seed curriculum into a production release package:
//   - release-bundle/curriculum.db
//   - release-bundle/curriculum.db.gz
//   - release-bundle/curriculum-v1.0.0.db.gz
//   - release-bundle/manifest.json
// ==============================================================================

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import esbuild from 'esbuild';
import Database from 'better-sqlite3';

const ROOT_DIR = process.cwd();
const OUTPUT_DIR = path.resolve(ROOT_DIR, 'release-bundle');
const SCHEMA_PATH = path.resolve(ROOT_DIR, 'src/main/db/curriculumSchema.sql');
const DB_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'curriculum.db');
const GZ_OUTPUT_PATH = path.resolve(OUTPUT_DIR, 'curriculum.db.gz');
const VERSIONED_GZ_PATH = path.resolve(OUTPUT_DIR, 'curriculum-v1.0.0.db.gz');
const MANIFEST_PATH = path.resolve(OUTPUT_DIR, 'manifest.json');

async function compileSeedRunner() {
  console.log('[1/6] Compiling TypeScript seeders with esbuild...');

  const runnerSource = `
    import { DatabaseManager } from './src/main/db/databaseManager';
    import { seedAllCurriculum } from './src/main/seeds/index';

    export function executeSeeding(db) {
      const dbManager = new DatabaseManager({
        curriculumDbPath: '',
        userProfileDbPath: ''
      });
      dbManager.seedOfficialSections(db);
      seedAllCurriculum(db);
    }
  `;

  const buildResult = await esbuild.build({
    stdin: {
      contents: runnerSource,
      resolveDir: ROOT_DIR,
      sourcefile: 'seed_runner.ts',
      loader: 'ts'
    },
    bundle: true,
    platform: 'node',
    format: 'esm',
    external: ['better-sqlite3'],
    write: false
  });

  const tempRunnerPath = path.resolve(ROOT_DIR, '.temp_seed_runner.mjs');
  fs.writeFileSync(tempRunnerPath, buildResult.outputFiles[0].text, 'utf8');

  try {
    const runnerModule = await import('file:///' + tempRunnerPath.replace(/\\/g, '/'));
    return runnerModule.executeSeeding;
  } finally {
    if (fs.existsSync(tempRunnerPath)) {
      fs.unlinkSync(tempRunnerPath);
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log(' GRADGATE GITHUB RELEASE BUNDLE GENERATOR (EDITION v1.0.0)');
  console.log('================================================================\n');

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Remove existing database if present
  if (fs.existsSync(DB_OUTPUT_PATH)) {
    fs.unlinkSync(DB_OUTPUT_PATH);
  }

  // 1. Compile seed runner
  const executeSeeding = await compileSeedRunner();

  // 2. Initialize database & schema
  console.log('[2/6] Initializing clean SQLite database and applying schema...');
  const db = new Database(DB_OUTPUT_PATH);
  db.pragma('foreign_keys = ON');

  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
  db.exec(schemaSql);

  // 3. Execute seeding
  console.log('[3/6] Populating curriculum seeds (8 Sections + Full Mocks + PYQs)...');
  executeSeeding(db);

  // 4. Verify Database Integrity & Collect Metrics
  console.log('[4/6] Verifying SQLite database integrity...');
  const integrity = db.prepare('PRAGMA integrity_check').get();
  if (integrity.integrity_check !== 'ok') {
    throw new Error(`Database integrity check failed: ${JSON.stringify(integrity)}`);
  }

  const sectionsCount = db.prepare('SELECT COUNT(*) as c FROM syllabus_sections').get().c;
  const unitsCount = db.prepare('SELECT COUNT(*) as c FROM units').get().c;
  const nodesCount = db.prepare('SELECT COUNT(*) as c FROM stepping_nodes').get().c;
  const questionsCount = db.prepare('SELECT COUNT(*) as c FROM questions').get().c;
  const lecturesCount = db.prepare('SELECT COUNT(*) as c FROM youtube_lectures').get().c;
  const papersCount = db.prepare('SELECT COUNT(*) as c FROM mock_papers').get().c;
  const cardsCount = db.prepare('SELECT COUNT(*) as c FROM formula_cards').get().c;

  // Record initial entry in content_manifest table
  const publishedAt = new Date().toISOString();
  db.prepare(`
    INSERT INTO content_manifest (
      version, schema_version, published_at, sha256_checksum,
      total_questions, total_nodes, total_lectures, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    '1.0.0',
    1,
    publishedAt,
    'v1.0.0-checksum-pending',
    questionsCount,
    nodesCount,
    lecturesCount,
    'Official GATE DA 2026 Master Curriculum Seed Bundle (Math + Core CS/AI + Full Mocks)'
  );

  // Close database to flush buffers to disk
  db.close();

  // 5. Compute SHA-256 & Update Manifest
  console.log('[5/6] Computing SHA-256 and generating Gzip compression...');
  const uncompressedBuffer = fs.readFileSync(DB_OUTPUT_PATH);
  const dbSha256 = crypto.createHash('sha256').update(uncompressedBuffer).digest('hex');

  // Re-open briefly to update the content_manifest record with true checksum
  const dbUpdate = new Database(DB_OUTPUT_PATH);
  dbUpdate.prepare(`
    UPDATE content_manifest SET sha256_checksum = ? WHERE version = ?
  `).run(dbSha256, '1.0.0');
  dbUpdate.close();

  // Re-read final buffer after manifest update
  const finalDbBuffer = fs.readFileSync(DB_OUTPUT_PATH);
  const finalSha256 = crypto.createHash('sha256').update(finalDbBuffer).digest('hex');

  // 6. Compress with Gzip
  console.log('[6/6] Writing release artifacts...');
  const compressedBuffer = zlib.gzipSync(finalDbBuffer, { level: 9 });

  fs.writeFileSync(GZ_OUTPUT_PATH, compressedBuffer);
  fs.writeFileSync(VERSIONED_GZ_PATH, compressedBuffer);

  const manifest = {
    version: '1.0.0',
    schema_version: 1,
    published_at: publishedAt,
    sha256_checksum: finalSha256,
    total_questions: questionsCount,
    total_nodes: nodesCount,
    total_lectures: lecturesCount,
    notes: 'Official GATE DA 2026 Master Curriculum Seed Bundle (Math + Core CS/AI + Full Mocks)'
  };

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');

  // Print Summary Table
  console.log('\n================================================================');
  console.log(' RELEASE BUNDLE GENERATION SUCCESSFUL');
  console.log('================================================================');
  console.table({
    'Curriculum Version': manifest.version,
    'Schema Version': manifest.schema_version,
    'Syllabus Sections': sectionsCount,
    'Curriculum Units': unitsCount,
    'Stepping Nodes': nodesCount,
    'Questions (MCQ/MSQ/NAT)': questionsCount,
    'YouTube Lectures': lecturesCount,
    'Full Mock Papers': papersCount,
    'Formula Cards': cardsCount,
    'Uncompressed DB Size': `${(finalDbBuffer.length / 1024).toFixed(1)} KB`,
    'Gzip Archive Size': `${(compressedBuffer.length / 1024).toFixed(1)} KB`,
    'SHA-256 Checksum': finalSha256.slice(0, 16) + '...'
  });

  console.log('\nGenerated files in release-bundle/:');
  console.log(`  - ${path.relative(ROOT_DIR, DB_OUTPUT_PATH)}`);
  console.log(`  - ${path.relative(ROOT_DIR, GZ_OUTPUT_PATH)}`);
  console.log(`  - ${path.relative(ROOT_DIR, VERSIONED_GZ_PATH)}`);
  console.log(`  - ${path.relative(ROOT_DIR, MANIFEST_PATH)}`);
  console.log('\nReady for GitHub Release upload or direct repository hosting!\n');
}

main().catch((err) => {
  console.error('\n[BUILD RELEASE BUNDLE FAILED]:', err);
  process.exit(1);
});
