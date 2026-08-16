import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/users/:userId', (req, res) => {
    res.status(200).json({ userId: req.params.userId });
  });
  app.get('/search', (req, res) => {
    const query = req.query.q ?? '';
    const rawLimit = req.query.limit ?? '20';
    const limit = Number(rawLimit);
    if (
      typeof query !== 'string' ||
      typeof rawLimit !== 'string' ||
      !Number.isFinite(limit) ||
      limit < 1
    ) {
      return res.status(400).json({ message: 'Invalid query' });
    }
    return res.status(200).json({ query, limit });
  });
  app.get('/users/:userId/posts/:postId', (req, res) => {
    res.status(200).json({
      userId: req.params.userId,
      postId: req.params.postId,
    });
  });
  app.post('/users', (req, res) => {
    const { name, email } = req.body ?? {};
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    res.status(201).json({ user: req.body });
  });
  app.put('/users/:userId', (req, res) => {
    const updates = req.body ?? {};
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates are required' });
    }
    return res.status(200).json({ userId: req.params.userId, updates });
  });
  app.delete('/users/:userId', (req, res) => {
    res
      .status(200)
      .json({ message: 'User deleted', userId: req.params.userId });
  });
  app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });
  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return next(error);
  });

  return app;
}
