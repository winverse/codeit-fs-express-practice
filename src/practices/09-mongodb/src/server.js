import { createApp } from './app.js';
import { connectDB } from './db/index.js';

export async function startServer({ uri, port = 0 }) {
  await connectDB(uri);
  const server = createApp().listen(port);

  return {
    server,
    async close() {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}
