import { Router } from 'express';
import { validateUser } from '../middlewares/validateUser.js';

export function createUsersRouter() {
  const router = Router();
  const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

  router.get('/boom', async () => {
    throw new Error('unexpected failure');
  });
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: '없는 사용자 오류를 완성하세요.' });
  });
  router.post('/', validateUser, (_req, res) => {
    res.status(501).json({ message: '중복 이메일 오류를 완성하세요.', users });
  });

  return router;
}
