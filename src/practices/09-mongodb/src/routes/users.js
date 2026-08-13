import { Router } from 'express';

export function createUsersRouter() {
  const router = Router();

  router.get('/', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 목록 조회를 완성하세요.' });
  });
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 상세 조회를 완성하세요.' });
  });
  router.post('/', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 생성을 완성하세요.' });
  });
  router.patch('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 수정을 완성하세요.' });
  });
  router.delete('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 삭제를 완성하세요.' });
  });

  return router;
}
