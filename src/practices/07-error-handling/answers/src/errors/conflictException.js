import { HttpException } from './httpException.js';

export class ConflictException extends HttpException {
  constructor(message = 'Conflict') {
    super(409, message);
  }
}
