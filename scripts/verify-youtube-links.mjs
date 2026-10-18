#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REGISTRY_PATH = path.resolve(process.cwd(), 'src/main/seeds/youtube_lectures.json');

async function verifyYouTubeUrl(videoUrl) {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(videoUrl)}&format=json`;
  const res = await fetch(oembedUrl);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for ${videoUrl}`);
  }
  return await res.json();
}

async function main() {
  if (!fs.existsSync(REGISTRY_PATH)) {
    console.error(`[YOUTUBE-VERIFY] Missing file: ${REGISTRY_PATH}`);
    process.exit(1);
  }
  const lectures = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));
  let failed = 0;
  for (const item of lectures) {
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
  console.log(`\n[YOUTUBE-VERIFY PASS] All ${lectures.length} YouTube lectures verified live.`);
}

main();
