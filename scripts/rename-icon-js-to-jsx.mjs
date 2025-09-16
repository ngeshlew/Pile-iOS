import fs from 'node:fs';
import path from 'node:path';

const dirs = [
  path.resolve(process.cwd(), 'src/renderer/icons/img'),
  path.resolve(process.cwd(), 'src/renderer/icons/logos'),
];

for (const dir of dirs) {
  const entries = fs.readdirSync(dir);
  for (const file of entries) {
    if (!file.endsWith('.js')) continue;
    const full = path.join(dir, file);
    const content = fs.readFileSync(full, 'utf8');
    if (content.includes('<svg') || content.includes('</svg>')) {
      const target = full.replace(/\.js$/, '.jsx');
      fs.renameSync(full, target);
      console.log(`Renamed ${path.relative(process.cwd(), full)} -> ${path.basename(target)}`);
    }
  }
}