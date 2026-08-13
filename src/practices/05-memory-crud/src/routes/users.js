import { Router } from 'express';
import usersFixture from '../../fixtures/users.json' with { type: 'json' };

export function createUsersRouter() {
  const router = Router();
  const users = structuredClone(usersFixture);

  router.get('/', (_req, res) => {
    res.status(200).json({ users });
  });
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: '상세 조회를 완성하세요.' });
  });
  router.post('/', (_req, res) => {
    res.status(501).json({ message: '생성을 완성하세요.' });
  });
  router.patch('/:userId', (_req, res) => {
    res.status(501).json({ message: '수정을 완성하세요.' });
  });
  router.delete('/:userId', (_req, res) => {
    res.status(501).json({ message: '삭제를 완성하세요.' });
  });

  return router;
}
