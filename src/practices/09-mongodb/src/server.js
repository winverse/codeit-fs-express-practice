import { createApp } from './app.js';
import { connectDB } from './db/index.js';

export async function startServer({ uri, port = 0, onEvent = () => {} }) {
  await connectDB(uri);
  onEvent('db:connected');
  const server = createApp().listen(port);
  onEvent('http:listening');

  return {
    server,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
      onEvent('http:closed');
    },
  };
}
