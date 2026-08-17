import { HttpException } from '../errors/http-exception.js';

export function errorHandler(error, _req, res, _next) {
  if (error instanceof SyntaxError && error.status === 400) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON body',
    });
  }

  const isExpected = error instanceof HttpException;
  const status = isExpected ? error.statusCode : 500;
  const message = isExpected ? error.message : 'Internal server error';

  return res.status(status).json({ success: false, message });
}
