import { Router } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/user.js';

function sendDatabaseError(error, res) {
  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Email already exists' });
  }
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  throw error;
}

export function createUsersRouter() {
  const router = Router();

  router.get('/', async (_req, res) => {
    const users = await User.find().sort({ email: 1 });
    res.status(200).json({ users });
  });
  router.get('/:userId', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ user });
  });
  router.post('/', async (req, res) => {
    try {
      const user = await User.create(req.body);
      return res.status(201).json({ user });
    } catch (error) {
      return sendDatabaseError(error, res);
    }
  });
  router.patch('/:userId', async (req, res) => {
    const updates = req.body ?? {};
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Updates are required' });
    }
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    try {
      const user = await User.findByIdAndUpdate(req.params.userId, updates, {
        returnDocument: 'after',
        runValidators: true,
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.status(200).json({ user });
    } catch (error) {
      return sendDatabaseError(error, res);
    }
  });
  router.delete('/:userId', async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted', user });
  });

  return router;
}
