import { Router } from 'express';

export const usersRouter = Router();

usersRouter.get('/:userId', (req, res) => {
  res.status(200).json({ userId: req.params.userId });
});
