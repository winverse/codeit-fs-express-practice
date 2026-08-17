import { BadRequestException } from '../errors/bad-request-exception.js';

export function validateUser(req, _res, next) {
  const { name, email } = req.body ?? {};
  if (!name || !email) {
    return next(new BadRequestException('Name and email are required'));
  }
  return next();
}
