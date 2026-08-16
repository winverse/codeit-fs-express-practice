import { HttpException } from './httpException.js';

// TODO: 기본 message와 400 상태 코드를 부모 생성자에 전달하세요.
export class BadRequestException extends HttpException {}
