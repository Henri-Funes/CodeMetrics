import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = path.join(rootDir, 'frontend', 'dist');
const targetDir = path.join(rootDir, 'backend', 'public');

try {
  await fs.access(sourceDir);
} catch {
  console.error('Frontend build not found. Run "npm run build:frontend" first.');
  process.exit(1);
}

await fs.rm(targetDir, { recursive: true, force: true });
await fs.mkdir(targetDir, { recursive: true });
await fs.cp(sourceDir, targetDir, { recursive: true });

console.log(`Production UI copied to ${targetDir}`);
