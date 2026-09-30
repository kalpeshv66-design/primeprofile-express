// Hostinger Express entry point.
// Frontend assets are built during deployment with: npm run build
process.env.NODE_ENV = 'production';

import('tsx/esm')
  .then(() => import('./server.ts'))
  .catch((error) => {
    console.error('[PrimeProfile] Failed to start Express server:', error);
    process.exit(1);
  });
