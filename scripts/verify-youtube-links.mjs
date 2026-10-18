#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SEEDS_DIR = path.resolve(process.cwd(), 'src/main/seeds');

async function verifyYouTubeUrl(videoUrl) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${videoUrl}`);
  }
  return await res.json();
}

async function main() {
  if (!fs.existsSync(SEEDS_DIR)) {
    console.error(`[YOUTUBE-VERIFY] Missing directory: ${SEEDS_DIR}`);
    process.exit(1);
  }

  const jsonFiles = fs.readdirSync(SEEDS_DIR).filter((f) => f.startsWith('youtube_lectures') && f.endsWith('.json'));
  let allLectures = [];
  for (const f of jsonFiles) {
    const content = JSON.parse(fs.readFileSync(path.join(SEEDS_DIR, f), 'utf8'));
    allLectures = allLectures.concat(content);
  }
  let failed = 0;
  for (const item of allLectures) {
    try {
      const meta = await verifyYouTubeUrl(item.youtubeUrl);
      console.log(`[OK] [${item.language}] ${item.topicId} -> "${meta.title}" by ${meta.author_name}`);
    } catch (err) {
      console.error(`[BROKEN/HALLUCINATED YOUTUBE LINK] ${item.topicId}: ${item.youtubeUrl} (${err.message})`);
      failed++;
    }
  }
  if (failed > 0) {
    console.error(`\n[YOUTUBE-VERIFY FAILED] ${failed} invalid or hallucinated YouTube URLs found.`);
    process.exit(1);
  }
  console.log(`\n[YOUTUBE-VERIFY PASS] All ${allLectures.length} YouTube lectures verified live.`);
}

main();
