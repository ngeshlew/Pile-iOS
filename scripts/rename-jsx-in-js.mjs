import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(process.cwd(), 'src/renderer');

/** Recursively walk directory */
function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walk(full);
    } else {
      yield full;
    }
  }
}

let renamed = 0;
for (const file of walk(root)) {
  if (!file.endsWith('.js')) continue;
  const rel = path.relative(process.cwd(), file);
  const text = fs.readFileSync(file, 'utf8');
  // Heuristic: contains JSX-like angle tag on its own line
  if (/[<][A-Za-z]/.test(text) || text.includes('</')) {
    const target = file.replace(/\.js$/, '.jsx');
    fs.renameSync(file, target);
    console.log(`Renamed ${rel} -> ${path.relative(process.cwd(), target)}`);
    renamed++;
  }
}

console.log(`Total renamed: ${renamed}`);
