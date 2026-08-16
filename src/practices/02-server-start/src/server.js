import express from 'express';

export function createApp() {
  const app = express();

  app.use(express.json());
  // TODO: GET / 요청에 메시지와 현재 ISO 날짜를 JSON으로 응답하세요.
  app.get('/', (_req, res) => {
    res.status(501).json({ message: '기본 라우트를 완성하세요.' });
  });

  // TODO: 위 라우트에 맞지 않는 요청에 404 JSON을 응답하세요.

  return app;
}
