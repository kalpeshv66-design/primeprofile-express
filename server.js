// Hostinger Express entry point. Avoid top-level await because Hostinger may require() this file.
process.env.NODE_ENV = 'production';
import('tsx/esm').then(() => import('./server.ts')).catch((error) => {
  console.error('[PrimeProfile] Failed to start Express server:', error);
  process.exit(1);
});
