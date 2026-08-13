import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.get('/', (_req, res) => {
    res.status(200).json({
      message: 'Hello Express!',
      timestamp: new Date().toISOString(),
    });
  });
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  return app;
}
