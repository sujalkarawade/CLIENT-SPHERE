/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import './load-env.js';
import path from 'path';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON payload parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Log incoming backend requests for diagnostics
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Mount API Endpoints FIRST
  app.use('/api', apiRouter);

  // Healthcheck endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  const isStandalone = process.argv.includes('--standalone');

  // Chaining front-end assets based on environments
  if (process.env.NODE_ENV !== 'production' && !isStandalone) {
    console.log('Loading Vite developer middleware...');
    const vite = await createViteServer({
      configFile: path.join(process.cwd(), 'frontend/vite.config.ts'),
      root: path.join(process.cwd(), 'frontend'),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.NODE_ENV !== 'production' && isStandalone) {
    console.log('Running in standalone backend mode. API endpoints only.');
    app.get('/', (req, res) => {
      res.send(`
        <div style="font-family: sans-serif; padding: 2rem; background: #0b0c10; color: #c5c6c7; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;">
          <h1 style="color: #66fcf1; margin-bottom: 1rem;">ClientSphere API Backend</h1>
          <p>The backend API server is running on port 3000.</p>
          <p>To access the client interface, make sure you start the frontend dev server:</p>
          <p><code style="background: #1f2833; padding: 0.5rem 1rem; border-radius: 4px; color: #66fcf1; font-family: monospace;">npm run dev:frontend</code></p>
          <p style="margin-top: 1.5rem;">Access the frontend at: <a href="http://localhost:5173" style="color: #66fcf1; text-decoration: none; font-weight: bold;">http://localhost:5173</a></p>
        </div>
      `);
    });
  } else {
    console.log('Serving production-ready static assets from dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to localhost on port 3000
  app.listen(PORT, 'localhost', () => {
    console.log(`ClientSphere fullstack engine online at http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal failure launching server:', err);
  process.exit(1);
});