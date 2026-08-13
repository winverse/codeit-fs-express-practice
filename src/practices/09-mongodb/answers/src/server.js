import { createApp } from './app.js';
import { connectDB, disconnectDB } from './db/index.js';
import { User } from './models/user.js';

export async function startServer({ uri, port = 0, onEvent = () => {} }) {
  let server;

  try {
    await connectDB(uri);
    onEvent('db:connected');
    await User.init();
    onEvent('db:indexes-ready');
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
    try {
      await disconnectDB();
    } finally {
      onEvent('db:closed');
    }
    throw error;
  }

  onEvent('http:listening');

  return {
    server,
    async close() {
      try {
        if (server?.listening) {
          await new Promise((resolve, reject) => {
            server.close((error) => (error ? reject(error) : resolve()));
          });
          onEvent('http:closed');
        }
      } finally {
        try {
          await disconnectDB();
        } finally {
          onEvent('db:closed');
        }
      }
    },
  };
}
