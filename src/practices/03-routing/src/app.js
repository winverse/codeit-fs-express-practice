import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get('/users/:userId', (_req, res) => {
    res.status(501).json({ message: 'URL 매개변수 라우트를 완성하세요.' });
  });
  app.get('/search', (_req, res) => {
    res.status(501).json({ message: '쿼리 문자열 라우트를 완성하세요.' });
  });
  app.get('/users/:userId/posts/:postId', (_req, res) => {
    res.status(501).json({ message: '중첩 경로 라우트를 완성하세요.' });
  });
  app.post('/users', (_req, res) => {
    res.status(501).json({ message: '생성 라우트를 완성하세요.' });
  });
  app.put('/users/:userId', (_req, res) => {
    res.status(501).json({ message: '수정 라우트를 완성하세요.' });
  });
  app.delete('/users/:userId', (_req, res) => {
    res.status(501).json({ message: '삭제 라우트를 완성하세요.' });
  });
  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return next(error);
  });

  return app;
}
