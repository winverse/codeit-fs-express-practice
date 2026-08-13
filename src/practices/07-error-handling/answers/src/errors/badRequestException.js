import { HttpException } from './httpException.js';

export class BadRequestException extends HttpException {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}
