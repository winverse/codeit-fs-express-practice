import { Router } from 'express';
import { validateUser } from '../middlewares/validate-user.js';

export function createUsersRouter() {
  const router = Router();
  const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];

  router.get('/boom', async () => {
    throw new Error('unexpected failure');
  });
  // TODO: userId로 사용자를 찾고 없으면 NotFoundException을 전달하세요.
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: '없는 사용자 오류를 완성하세요.' });
  });
  // TODO: 중복 email이면 ConflictException, 아니면 생성된 사용자를 응답하세요.
  router.post('/', validateUser, (_req, res) => {
    res.status(501).json({ message: '중복 이메일 오류를 완성하세요.', users });
  });

  return router;
}
