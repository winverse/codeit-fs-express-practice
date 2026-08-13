import { HttpException } from './httpException.js';

export class NotFoundException extends HttpException {
  constructor(message = 'Not found') {
    super(404, message);
  }
}
