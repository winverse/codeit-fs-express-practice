import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.get('/', (_req, res) =>
    res.status(200).json({ message: 'Hello Express!' }),
  );
  app.get('/users/:userId', (req, res) => {
    res.status(200).json({ userId: req.params.userId });
  });
  app.get('/search', (req, res) => {
    res.status(200).json({
      query: req.query.q ?? '',
      limit: Number(req.query.limit ?? 20),
    });
  });

  return app;
}
