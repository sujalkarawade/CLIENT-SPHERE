/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api';

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

  // Chaining front-end assets based on environments
  if (process.env.NODE_ENV !== 'production') {
    console.log('Loading Vite developer middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
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
