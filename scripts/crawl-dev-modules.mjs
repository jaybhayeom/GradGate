async function testImports() {
  const visited = new Set();
  const queue = ['http://localhost:5173/src/main.tsx'];
  let errors = 0;

  while (queue.length > 0 && visited.size < 150) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    try {
      const res = await fetch(url);
      if (!res.ok) {
        console.error('[FETCH FAILED]', res.status, url);
        errors++;
        continue;
      }
      const text = await res.text();
      const regex = /from\s+["']([^"']+)["']/g;
      let m;
      while ((m = regex.exec(text)) !== null) {
        const spec = m[1];
        if (spec.startsWith('/') || spec.startsWith('.')) {
          const resolved = new URL(spec, url).href;
          if (!visited.has(resolved)) {
            queue.push(resolved);
          }
        }
      }
    } catch (e) {
      console.error('[ERROR]', url, e.message);
      errors++;
    }
  }

  console.log(`[CRAWL COMPLETE] Crawled ${visited.size} internal modules successfully with ${errors} errors.`);
  if (errors > 0) process.exit(1);
}

testImports();
