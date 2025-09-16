#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const os = require('os');
const matter = require('gray-matter');
const crypto = require('crypto');

function usage() {
  console.log('Usage: node export-piles-to-mobile.js [--input <pilesDir>] [--out <outputFile>]');
}

function hashId(input) {
  return crypto.createHash('sha1').update(input).digest('hex');
}

function walkDir(dir, exts = new Set(['.md', '.mdx'])) {
  const results = [];
  (function walk(current) {
    const entries = fs.readdirSync(current, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (exts.has(path.extname(entry.name).toLowerCase())) {
        results.push(full);
      }
    }
  })(dir);
  return results;
}

function deriveTitle(content, data) {
  if (data && typeof data.title === 'string' && data.title.trim()) return String(data.title).trim();
  const firstLine = (content || '').split(/\r?\n/).find((l) => l.trim().length > 0) || '';
  const heading = firstLine.replace(/^\s*#+\s*/, '').trim();
  return heading || undefined;
}

function deriveCreatedAt(stats, data) {
  if (data && data.date) {
    const t = Date.parse(data.date);
    if (!Number.isNaN(t)) return t;
  }
  return stats.birthtimeMs ? Math.floor(stats.birthtimeMs) : Date.now();
}

function main() {
  const argv = process.argv.slice(2);
  let inputDir = path.join(os.homedir(), 'Piles');
  let outFile = `pile-export-${Date.now()}.json`;

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--input' && argv[i + 1]) {
      inputDir = argv[++i];
    } else if (a === '--out' && argv[i + 1]) {
      outFile = argv[++i];
    } else if (a === '--help' || a === '-h') {
      usage();
      process.exit(0);
    }
  }

  if (!fs.existsSync(inputDir)) {
    console.error(`Input directory does not exist: ${inputDir}`);
    process.exit(1);
  }

  const files = walkDir(inputDir);
  const posts = [];

  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      const parsed = matter(raw);
      const stats = fs.statSync(file);
      const id = hashId(`${file}:${stats.ino || ''}:${stats.size}`);
      const title = deriveTitle(parsed.content, parsed.data);
      const createdAt = deriveCreatedAt(stats, parsed.data);
      const content = parsed.content || '';
      posts.push({ id, title, content, createdAt });
    } catch (e) {
      console.warn(`Failed to parse ${file}: ${e.message}`);
    }
  }

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    source: 'pile-desktop',
    posts,
  };

  fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), 'utf8');
  console.log(`Exported ${posts.length} posts to ${outFile}`);
}

if (require.main === module) {
  main();
}