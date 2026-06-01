import cors from 'cors';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { env } from './config/env.js';
import { registerApiRoutes } from './routes/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      app: 'CodeMetrics API',
      status: 'running',
      docs: '/api/health'
    });
  });

  registerApiRoutes(app);

  app.use((error, _req, res, _next) => {
    let statusCode = error.statusCode ?? 500;
    let message = error.message;

    if (error.name === 'ValidationError' || error.name === 'CastError') {
      statusCode = 400;
    }

    if (error.code === 11000) {
      statusCode = 409;
      message = 'Duplicated unique field.';
    }

    res.status(statusCode).json({
      error: {
        message: statusCode === 500 ? 'Internal server error.' : message
      }
    });
  });

  if (env.nodeEnv === 'production') {
    const publicPath = path.resolve(__dirname, '../public');
    app.use(express.static(publicPath));
    app.get('*splat', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  return app;
}
