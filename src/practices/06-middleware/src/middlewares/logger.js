export function createLogger({ write = console.log, trace = () => {} } = {}) {
  // TODO: 응답 완료 시 method·URL·status·실제 경과 시간을 기록하세요.
  return (_req, _res, next) => {
    trace('logger');
    write('logger를 완성하세요.');
    next();
  };
}
