import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());

  // TODO: req.params.userId를 응답하는 사용자 조회 라우트를 완성하세요.
  app.get('/users/:userId', (_req, res) => {
    res.status(501).json({ message: 'URL 매개변수 라우트를 완성하세요.' });
  });
  // TODO: q와 limit을 읽고 잘못된 쿼리를 400으로 처리하세요.
  app.get('/search', (_req, res) => {
    res.status(501).json({ message: '쿼리 문자열 라우트를 완성하세요.' });
  });
  // TODO: userId와 postId를 함께 응답하는 중첩 경로를 완성하세요.
  app.get('/users/:userId/posts/:postId', (_req, res) => {
    res.status(501).json({ message: '중첩 경로 라우트를 완성하세요.' });
  });
  // TODO: JSON body를 검증하고 사용자를 생성하는 라우트를 완성하세요.
  app.post('/users', (_req, res) => {
    res.status(501).json({ message: '생성 라우트를 완성하세요.' });
  });
  // TODO: 빈 body를 검증하고 수정 내용을 응답하는 라우트를 완성하세요.
  app.put('/users/:userId', (_req, res) => {
    res.status(501).json({ message: '수정 라우트를 완성하세요.' });
  });
  // TODO: 삭제한 userId를 응답하는 라우트를 완성하세요.
  app.delete('/users/:userId', (_req, res) => {
    res.status(501).json({ message: '삭제 라우트를 완성하세요.' });
  });
  // TODO: 위 라우트에 맞지 않는 요청에 404 JSON을 응답하세요.
  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return next(error);
  });

  return app;
}
