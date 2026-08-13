import { Router } from 'express';
import { searchRouter } from './search.js';
import { usersRouter } from './users.js';

export const rootRouter = Router();

rootRouter.get('/', (_req, res) => {
  res.status(200).json({ message: 'Hello Express!' });
});
rootRouter.use('/users', usersRouter);
rootRouter.use('/search', searchRouter);
rootRouter.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});
