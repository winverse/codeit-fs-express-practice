import express from 'express';
// TODO: routes/index.js의 rootRouter를 가져오세요.

export function createApp() {
  const app = express();

  app.use(express.json());
  // TODO: 아래 직접 정의한 라우트를 제거하고 rootRouter를 연결하세요.
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
