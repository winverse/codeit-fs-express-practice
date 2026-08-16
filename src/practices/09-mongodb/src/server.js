import express from 'express';
import { connectDB } from './db/index.js';
import { createUsersRouter } from './routes/users.js';

export function createApp() {
  const app = express();

  app.use(express.json());
  app.use('/users', createUsersRouter());
  // TODO: malformed JSON은 400, 예상 밖 오류는 내부 정보를 숨긴 500으로 응답하세요.
  app.use((error, _req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400) {
      return res.status(400).json({ message: 'Malformed JSON body' });
    }
    return next(error);
  });

  return app;
}

export async function startServer({ uri, port = 0 }) {
  // TODO: User를 import해 DB 연결 → index 준비 → HTTP listen 순서로 시작하세요.
  // TODO: 시작 실패와 close()에서 HTTP 서버와 DB 연결을 모두 정리하세요.
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
