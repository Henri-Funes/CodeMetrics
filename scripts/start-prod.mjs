import path from 'node:path';
import { fileURLToPath } from 'node:url';

process.env.NODE_ENV = 'production';

const backendDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'backend');
process.chdir(backendDir);

console.log('Starting CodeMetrics in production mode (API + SPA)...');

await import('../backend/src/server.js');
