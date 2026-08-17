import express from 'express';
import { createUsersRouter } from './routes/users.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/users', createUsersRouter());
  app.use((error, _req, res, _next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
