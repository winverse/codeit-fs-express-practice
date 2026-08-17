import { Router } from 'express';
import { validateUser } from '../middlewares/validate-user.js';

export function createUsersRouter({ trace = () => {} } = {}) {
  const router = Router();

  router.post('/', validateUser, (req, res) => {
    trace('route');
    res.status(201).json({ user: req.body });
  });

  return router;
}
