import express from 'express';
import { connectDB, disconnectDB } from './db/index.js';
import { User } from './models/user.js';
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

export async function startServer({ uri, port = 0 }) {
  let server;

  try {
    await connectDB(uri);
    await User.init();
    server = createApp().listen(port);
    await new Promise((resolve, reject) => {
      const handleListening = () => {
        server.off('error', handleError);
        resolve();
      };
      const handleError = (error) => {
        server.off('listening', handleListening);
        reject(error);
      };
      server.once('listening', handleListening);
      server.once('error', handleError);
    });
  } catch (error) {
    await disconnectDB();
    throw error;
  }

  return {
    server,
    async close() {
      try {
        if (server?.listening) {
          await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          });
        }
      } finally {
        await disconnectDB();
      }
    },
  };
}
