import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.get('/', (_req, res) => {
    res.status(501).json({ message: '기본 라우트를 완성하세요.' });
  });

  return app;
}
