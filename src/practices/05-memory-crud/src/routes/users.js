import { Router } from 'express';
import usersFixture from '../../fixtures/users.json' with { type: 'json' };

export function createUsersRouter() {
  const router = Router();
  const users = structuredClone(usersFixture);
  // TODO: fixture의 다음 사용자 id를 계산해 nextId를 준비하세요.

  router.get('/', (_req, res) => {
    res.status(200).json({ users });
  });
  // TODO: userId로 사용자를 찾아 200 또는 404를 응답하세요.
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: '상세 조회를 완성하세요.' });
  });
  // TODO: name과 email을 검증하고 새 사용자를 추가하세요.
  router.post('/', (_req, res) => {
    res.status(501).json({ message: '생성을 완성하세요.' });
  });
  // TODO: body와 userId를 검증하고 사용자를 수정하세요.
  router.patch('/:userId', (_req, res) => {
    res.status(501).json({ message: '수정을 완성하세요.' });
  });
  // TODO: userId로 사용자를 찾아 삭제하거나 404를 응답하세요.
  router.delete('/:userId', (_req, res) => {
    res.status(501).json({ message: '삭제를 완성하세요.' });
  });

  return router;
}
