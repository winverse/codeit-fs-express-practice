import { HttpException } from './http-exception.js';

export class BadRequestException extends HttpException {
  constructor(description = 'BAD_REQUEST') {
    super(description, 400);
  }
}
