import express from 'express';
import { rootRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(rootRouter);

  return app;
}
