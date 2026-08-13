import express from 'express';
import { errorHandler } from './middlewares/errorHandler.js';
import { createUsersRouter } from './routes/users.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/users', createUsersRouter());
  app.use(errorHandler);

  return app;
}
