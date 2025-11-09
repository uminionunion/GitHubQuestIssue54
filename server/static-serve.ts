// server/static-serve.ts
import path from 'path';
import fs from 'fs';
import express from 'express';
import type { Express } from 'express';

/**
 * Serve built frontend and provide SPA fallback.
 * Works in both dev (process.cwd()/public) and production (dist/public when compiled to dist/server).
 */
export function setupStaticServing(app: Express) {
  const publicDirFromDist = path.join(__dirname, '..', 'public');
  const publicDirFromRoot = path.join(process.cwd(), 'public');

  const publicDir = fs.existsSync(publicDirFromDist) ? publicDirFromDist : publicDirFromRoot;

  // Serve static assets but let API routes pass through
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    next();
  });

  app.use(express.static(publicDir));

  // SPA fallback: serve index.html for non-API GET requests that didn't match a static asset
  app.get('*', (req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    const indexPath = path.join(publicDir, 'index.html');
    res.sendFile(indexPath, (err) => {
      if (err) next(err);
    });
  });
}
