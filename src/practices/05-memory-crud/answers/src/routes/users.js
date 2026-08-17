import { Router } from 'express';
import usersFixture from '../../../fixtures/users.json' with { type: 'json' };

export function createUsersRouter() {
  const router = Router();
  let users = structuredClone(usersFixture);
  let nextId = Math.max(...users.map((user) => user.id), 0) + 1;

  router.get('/', (_req, res) => {
    res.status(200).json({ users });
  });
  router.get('/:userId', (req, res) => {
    const user = users.find(({ id }) => id === Number(req.params.userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  });
  router.post('/', (req, res) => {
    const { name, email } = req.body ?? {};
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }
    const user = { id: nextId, name, email };
    nextId += 1;
    users.push(user);
    return res.status(201).json({ user });
  });
  router.patch('/:userId', (req, res) => {
    const updates = req.body ?? {};
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates are required' });
    }
    const user = users.find(({ id }) => id === Number(req.params.userId));
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    Object.assign(user, updates);
    return res.status(200).json({ user });
  });
  router.delete('/:userId', (req, res) => {
    const userId = Number(req.params.userId);
    const user = users.find(({ id }) => id === userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    users = users.filter(({ id }) => id !== userId);
    return res.status(200).json({ message: 'User deleted', user });
  });

  return router;
}
