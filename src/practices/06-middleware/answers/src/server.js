import express from 'express';
import { createCors } from './middlewares/cors.js';
import { createLogger } from './middlewares/logger.js';
import { createUsersRouter } from './routes/users.js';

export function createApp(options = {}) {
  const app = express();

  app.use(createCors(options));
  app.use(express.json());
  app.use(createLogger(options));
  app.use('/users', createUsersRouter(options));
  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return next(error);
  });

  return app;
}
