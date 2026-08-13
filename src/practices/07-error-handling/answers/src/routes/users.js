import { Router } from 'express';
import { ConflictException } from '../errors/conflictException.js';
import { NotFoundException } from '../errors/notFoundException.js';
import { validateUser } from '../middlewares/validateUser.js';

export function createUsersRouter() {
  const router = Router();
  const users = [{ id: 1, name: 'Alice', email: 'alice@example.com' }];
  let nextId = 2;

  router.get('/boom', async () => {
    throw new Error('unexpected failure');
  });
  router.get('/:userId', (req, res, next) => {
    const user = users.find(({ id }) => id === Number(req.params.userId));
    if (!user) {
      return next(new NotFoundException('User not found'));
    }
    return res.status(200).json({ user });
  });
  router.post('/', validateUser, (req, res, next) => {
    const duplicate = users.some(({ email }) => email === req.body.email);
    if (duplicate) {
      return next(new ConflictException('Email already exists'));
    }
    const user = { id: nextId, ...req.body };
    nextId += 1;
    users.push(user);
    return res.status(201).json({ user });
  });

  return router;
}
