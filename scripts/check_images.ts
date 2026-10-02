import https from 'https';
import http from 'http';
import { PRODUCTS, PROMO_BANNERS } from '../src/data/products.ts';
import { CATEGORIES } from '../src/data/categories.ts';

const urls = new Set<string>();

PRODUCTS.forEach(p => {
  if (p.image) urls.add(p.image);
  p.galleryImages?.forEach(g => urls.add(g));
});

CATEGORIES.forEach(c => {
  if (c.image) urls.add(c.image);
});

PROMO_BANNERS.forEach(b => {
  if (b.image) urls.add(b.image);
});

console.log(`Found ${urls.size} unique URLs.`);

async function checkUrl(url: string) {
  if (url.startsWith('/')) {
    console.log(`[LOCAL] ${url} (Local public asset)`);
    return true;
  }
  return new Promise((resolve) => {
    try {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 400) {
          console.log(`[OK ${res.statusCode}] ${url.slice(0, 70)}...`);
          resolve(true);
        } else {
          console.log(`[FAIL ${res.statusCode}] ${url}`);
          resolve(false);
        }
      }).on('error', (err) => {
        console.log(`[ERROR] ${url}: ${err.message}`);
        resolve(false);
      });
    } catch (e: any) {
      console.log(`[EXCEPTION] ${url}: ${e.message}`);
      resolve(false);
    }
  });
}

async function run() {
  for (const u of Array.from(urls)) {
    await checkUrl(u);
  }
}

run();
