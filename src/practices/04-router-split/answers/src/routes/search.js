import { Router } from 'express';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
  const query = req.query.q ?? '';
  const rawLimit = req.query.limit ?? '20';
  const limit = Number(rawLimit);
  if (
    typeof query !== 'string' ||
    typeof rawLimit !== 'string' ||
    !Number.isFinite(limit) ||
    limit < 1
  ) {
    return res.status(400).json({ message: 'Invalid query' });
  }
  return res.status(200).json({ query, limit });
});
