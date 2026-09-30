import { spawnSync } from 'node:child_process';

process.env.NODE_ENV = 'production';

// Hostinger's Express preset starts server.js directly, so build the Vite UI here
// before loading the TypeScript API/server.
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const build = spawnSync(npm, ['run', 'build'], { stdio: 'inherit', env: process.env });
if (build.status !== 0) {
  console.error('[PrimeProfile] Vite production build failed.');
  process.exit(build.status ?? 1);
}

import('tsx/esm')
  .then(() => import('./server.ts'))
  .catch((error) => {
    console.error('[PrimeProfile] Failed to start Express server:', error);
    process.exit(1);
  });
