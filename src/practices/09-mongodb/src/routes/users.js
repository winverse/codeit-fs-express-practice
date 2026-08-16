import { Router } from 'express';

export function createUsersRouter() {
  const router = Router();

  // TODO: email 오름차순으로 사용자 목록을 조회하세요.
  router.get('/', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 목록 조회를 완성하세요.' });
  });
  // TODO: ObjectId를 검증하고 사용자를 조회하거나 400·404를 응답하세요.
  router.get('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 상세 조회를 완성하세요.' });
  });
  // TODO: 사용자를 생성하고 validation·중복 오류를 변환하세요.
  router.post('/', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 생성을 완성하세요.' });
  });
  // TODO: body와 ObjectId를 검증하고 사용자를 수정하세요.
  router.patch('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 수정을 완성하세요.' });
  });
  // TODO: ObjectId를 검증하고 사용자를 삭제하거나 404를 응답하세요.
  router.delete('/:userId', (_req, res) => {
    res.status(501).json({ message: 'MongoDB 삭제를 완성하세요.' });
  });

  return router;
}
