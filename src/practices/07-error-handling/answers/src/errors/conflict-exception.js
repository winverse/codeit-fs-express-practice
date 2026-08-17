import { HttpException } from './http-exception.js';

export class ConflictException extends HttpException {
  constructor(description = 'CONFLICT') {
    super(description, 409);
  }
}
